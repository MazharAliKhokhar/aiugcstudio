/**
 * app/api/generate/route.ts
 * Core video generation endpoint.
 *
 * Flow:
 *  1. Authenticate user via Supabase session
 *  2. Validate & sanitize input (Zod)
 *  3. Rate-limit: max 10 generations per hour per user
 *  4. Atomically deduct credits (Postgres RPC — prevents race conditions)
 *  5. Create a pending video DB record (with admin fallback for RLS edge cases)
 *  6. Boot the private Jarvislabs GPU if it is paused
 *  7. Send the prompt to the Wan 2.1 inference server
 *  8. Save the returned video URL and mark status as 'completed'
 *  9. Auto-pause the GPU to stop billing immediately
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCreditCost } from '@/lib/credits'

// ─── Input Validation Schema ─────────────────────────────────────────────────

const GenerateSchema = z.object({
  url:         z.string().url('Must be a valid URL').max(500),
  productName: z.string().max(500).optional().or(z.literal('')),
  goal:        z.enum(['sales', 'awareness', 'retargeting']),
  prompt:      z.string().min(10, 'Prompt too short').max(5000),
  duration:    z.number().refine(v => [15, 30, 45, 60].includes(v), {
    message: 'Duration must be 15, 30, 45, or 60 seconds'
  })
})

// ─── Helper: Build absolute Jarvis URL from response ─────────────────────────

function toAbsoluteUrl(path: string, base: string): string {
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

// ─── Helper: Insert video row with admin fallback ─────────────────────────────

async function insertVideoRow(supabase: any, payload: any) {
  const { data, error } = await (supabase.from('videos') as any)
    .insert(payload)
    .select('id')
    .single()

  if (data) return data

  // Admin fallback — bypasses RLS if standard insert fails
  console.warn('[Generate] Standard insert failed, using admin fallback:', error?.message)
  const admin = createAdminClient()
  const { data: adminData, error: adminError } = await (admin.from('videos') as any)
    .insert(payload)
    .select('id')
    .single()

  if (!adminData) throw new Error(adminError?.message || 'Failed to create video record')
  return adminData
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export const maxDuration = 60 // Increase Vercel timeout to 60s (requires Pro/Enterprise for higher)

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 2. Input Validation
    const body = await req.json()
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) {
      const detail = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: `Invalid input: ${detail}` }, { status: 400 })
    }
    const { url, productName, goal, prompt, duration } = parsed.data

    // 3. Rate Limiting — max 10 generations per user per hour
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
    const { count } = await (supabase.from('videos') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('created_at', oneHourAgo)

    if (count !== null && count >= 10) {
      return NextResponse.json(
        { error: 'Hourly limit reached (10 videos/hr). Please wait before generating more.' },
        { status: 429 }
      )
    }

    // 4. Atomic Credit Deduction (SKIP if this is a retry of a pending video)
    const requiredUnits = getCreditCost(duration)
    let videoId: string | null = null
    let alreadyDeducted = false

    // Check if a pending video for this prompt already exists (prevents double-deduction on retries)
    const { data: existingPending } = await (supabase.from('videos') as any)
      .select('id, status')
      .eq('user_id', user.id)
      .eq('prompt', prompt)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingPending) {
      videoId = existingPending.id
      alreadyDeducted = true
      console.log(`[Generate] Found existing pending video ${videoId}, skipping credit deduction.`)
    }

    if (!alreadyDeducted) {
      const { data: newBalance, error: deductError } = await (supabase as any).rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount:  requiredUnits
      })

      if (deductError) {
        console.error('[Generate] Credit deduction RPC error:', deductError)
        return NextResponse.json({ error: 'Failed to process credits. Please try again.' }, { status: 500 })
      }
      if (newBalance === -1) {
        return NextResponse.json(
          { error: `Insufficient credits. Need ${requiredUnits} unit(s).` },
          { status: 402 }
        )
      }

      // 5. Create pending video record (only if not already created)
      const videoPayload = {
        user_id:  user.id,
        prompt,
        status:   'pending',
        duration,
        script:   `Product: ${productName || 'N/A'}\nURL: ${url}\nGoal: ${goal}`
      }
      const videoData = await insertVideoRow(supabase, videoPayload)
      videoId = videoData.id
    }

    // 6. Resolve Jarvis GPU Config
    const jarvisId    = process.env.JARVISLABS_INSTANCE_ID?.trim()
    const jarvisName  = process.env.JARVISLABS_INSTANCE_NAME?.trim()
    const jarvisKey   = process.env.JARVISLABS_API_KEY?.trim()
    const jarvisIdentifier = jarvisName || jarvisId

    if (!jarvisIdentifier || !jarvisKey) {
      return NextResponse.json({ 
        error: 'Missing Environment Variables. Please add JARVISLABS_API_KEY and JARVISLABS_INSTANCE_NAME (or ID) to your Vercel Project Settings.' 
      }, { status: 500 })
    }

    // 7. Auto-Start & Resolve GPU
    const { jarvis } = await import('@/lib/jarvis')
    let resolvedJarvisUrl: string | null = null
    
    try {
      resolvedJarvisUrl = await jarvis.checkReady(jarvisIdentifier)
      
      if (!resolvedJarvisUrl) {
         return NextResponse.json({ 
           status: 'booting', 
           message: 'GPU is warming up (60-90s). Please stay on this page.' 
         }, { status: 202 })
      }
    } catch (err: any) {
      console.error('[Generate] GPU Connection Error:', err.message)
      return NextResponse.json({ 
        error: `GPU Connection Error: ${err.message}. Please check if the instance is available in your Jarvislabs dashboard.`
      }, { status: 500 })
    }

    try {
      // 8. Send generation request to Wan 2.1 on Jarvislabs
      console.log(`[Generate] GPU is healthy at ${resolvedJarvisUrl}. Triggering generation...`)
      const token = await jarvis.getToken(jarvisIdentifier)

      // ONLY generate video here. Voiceover is handled in the stitch route to avoid redundant work.
      const videoRes = await fetch(`${resolvedJarvisUrl}/generate`, {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body:    JSON.stringify({ 
          prompt,
          video_id: videoId as string,
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY
        }),
        signal: AbortSignal.timeout(55000) // Slightly less than Vercel max to catch it here
      })

      if (!videoRes.ok) {
        const errBody = await videoRes.text().catch(() => 'No error body')
        throw new Error(`Video Engine error (${videoRes.status}): ${errBody || videoRes.statusText}`)
      }

      const { video_url } = await videoRes.json()
      const fullVideoUrl = toAbsoluteUrl(video_url, resolvedJarvisUrl)

      // 9. Mark video as completed in DB (Using Admin for reliability)
      const admin = createAdminClient()
      await (admin.from('videos') as any)
        .update({ 
          video_url: fullVideoUrl, 
          status: 'completed',
          progress: 100
        })
        .eq('id', videoId as string)

      // 10. Auto-Pause (Fire-and-forget cleanup)
      jarvis.safePause(jarvisIdentifier)

      console.log(`[Generate] Successfully completed video ${videoId}`)
      return NextResponse.json({ success: true, videoId, videoUrl: fullVideoUrl })

    } catch (error: any) {
      console.error('[Generate] Generation process failed:', error.message)
      
      const admin = createAdminClient()

      // AUTO-REFUND logic: If it failed before we got a result, return the credits
      console.log(`[Generate] Refunding ${requiredUnits} unit(s) to user ${user.id}`)
      const { error: refundError } = await (admin as any).rpc('add_credits', {
        p_user_id: user.id,
        p_amount:  requiredUnits
      })

      if (refundError) console.error('[Generate] Refund RPC failed:', refundError)

      // Update video record to 'failed'
      if (videoId) {
        await (admin.from('videos') as any)
          .update({ 
            status: 'failed',
            failure_reason: error.message || 'Generation timeout'
          })
          .eq('id', videoId as string)
      }

      // Even on failure, we should probably pause if we resumed it
      jarvis.safePause(jarvisIdentifier)
      return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[Generate] Unhandled error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
