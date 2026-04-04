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

    // 4. Atomic Credit Deduction
    const requiredUnits = getCreditCost(duration)
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

    // 5. Create pending video record (standard client + admin fallback)
    const videoPayload = {
      user_id:  user.id,
      prompt,
      status:   'pending',
      duration,
      script:   `Product: ${productName || 'N/A'}\nURL: ${url}\nGoal: ${goal}`
    }
    const videoData = await insertVideoRow(supabase, videoPayload)
    const videoId = videoData.id

    const jarvisUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim()
    const jarvisId  = process.env.JARVISLABS_INSTANCE_ID?.trim()
    const jarvisKey = process.env.JARVISLABS_API_KEY?.trim()

    if (!jarvisUrl) throw new Error('NEXT_PUBLIC_JARVIS_API_URL is not configured')
    if (!jarvisId || !jarvisKey) {
      return NextResponse.json({ 
        error: 'Missing Environment Variables. Please add JARVISLABS_API_KEY and JARVISLABS_INSTANCE_ID to your Vercel Project Settings.' 
      }, { status: 500 })
    }

    // 6. Check GPU Readiness (Warming up check)
    if (jarvisId) {
      try {
        const { jarvis } = await import('@/lib/jarvis')
        
        // Optimistic check: If the GPU is already responding, skip status polling
        const isHealthy = await jarvis.heartbeat(jarvisUrl)
        
        if (!isHealthy) {
          console.log('[Generate] GPU not responding to heartbeat. Checking Global API status...')
          const status = await jarvis.getStatus(jarvisId)

          if (status.status !== 'Running') {
            console.log('[Generate] GPU is booting/warming up — asking client to retry')
            if (status.status === 'Paused') {
              await jarvis.resume(jarvisId).catch((re) => {
                console.error('[Generate] Resume failed:', re.message)
              })
            }
            return NextResponse.json({ 
              status: 'booting', 
              message: 'GPU is warming up (60-90s). Please stay on this page.' 
            }, { status: 202 })
          }
          
          // Re-check heartbeat if we just found out it was "Running" but heartbeat failed
          const secondHeartbeat = await jarvis.heartbeat(jarvisUrl)
          if (!secondHeartbeat) {
             throw new Error('GPU is Running but FastAPI is still booting. Try again in 30s.')
          }
        }
      } catch (err: any) {
        console.error('[Generate] GPU Connection Error:', err.message)
        return NextResponse.json({ 
          error: `GPU Connection Error: ${err.message}. Check your API Key, Instance ID, and URL.`
        }, { status: 500 })
      }
    }

    // 7. Send generation request to Wan 2.1 on Jarvislabs
    console.log('[Generate] GPU is healthy. Triggering generation...')
    const genResponse = await fetch(`${jarvisUrl}/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt })
    })

    if (!genResponse.ok) {
      const errText = await genResponse.text()
      throw new Error(`GPU Server error: ${errText || genResponse.statusText}`)
    }

    const { video_url } = await genResponse.json()
    const fullVideoUrl = toAbsoluteUrl(video_url, jarvisUrl)

    // 8. Mark video as completed
    await (supabase.from('videos') as any)
      .update({ video_url: fullVideoUrl, status: 'completed' })
      .eq('id', videoId)

    // 9. Auto-pause GPU immediately to stop billing
    if (jarvisId) {
      const { jarvis } = await import('@/lib/jarvis')
      jarvis.pause(jarvisId).catch((e: any) =>
        console.warn('[Generate] Auto-pause failed (non-critical):', e.message)
      )
    }

    return NextResponse.json({ success: true, videoId, videoUrl: fullVideoUrl })

  } catch (error: any) {
    console.error('[Generate] Unhandled error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
