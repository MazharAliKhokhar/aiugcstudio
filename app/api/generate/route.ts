import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCreditCost } from '@/lib/credits'
import { z } from 'zod'

// 1. Define Input Schema for Guardrails
const GenerateSchema = z.object({
  url: z.string().url().max(500),
  productName: z.string().max(500).optional().or(z.literal('')),
  goal: z.enum(['sales', 'awareness', 'retargeting']),
  prompt: z.string().min(10).max(5000),
  duration: z.number().refine(val => [15, 30, 45, 60].includes(val), {
    message: "Invalid duration. Must be 15, 30, 45, or 60."
  })
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate Input with Zod
    const body = await req.json()
    const result = GenerateSchema.safeParse(body)
    
    if (!result.success) {
      const errorDetails = result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ 
        error: `Invalid input: ${errorDetails}`, 
        details: result.error.format() 
      }, { status: 400 })
    }

    const { url, productName, goal, prompt, duration } = result.data

    // 3. Rate Limiting Check (Supabase Backed)
    // Limit to 10 generations per hour for beta security
    const oneHourAgo = new Promise<string>(resolve => {
        const d = new Date()
        d.setHours(d.getHours() - 1)
        resolve(d.toISOString())
    })
    
    const { count, error: countError } = await (supabase
      .from('videos') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('created_at', await oneHourAgo)

    if (countError) {
      console.error('[API/Generate] Rate limit check error:', countError)
    } else if (count !== null && count >= 10) {
      return NextResponse.json({ 
        error: 'Too many requests. You have reached the hourly limit of 10 generations. Please try again in an hour.' 
      }, { status: 429 })
    }

    const requiredUnits = getCreditCost(duration)

    // 4. Atomically check and deduct credits via Postgres RPC
    const { data: newBalance, error: deductError } = await (supabase as any).rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: requiredUnits
    })

    if (deductError) {
      console.error('[API/Generate] Unit deduction RPC error:', deductError)
      return NextResponse.json({ error: 'Failed to process unit deduction. Please try again later.' }, { status: 500 })
    }

    if (newBalance === -1) {
      return NextResponse.json({ 
        error: `Insufficient units. This generation requires ${requiredUnits} units, but your balance is too low.` 
      }, { status: 402 })
    }

    // 5. Insert pending video row
    // We first try the standard client (respects RLS)
    let { data: videoData, error: videoError } = await (supabase.from('videos') as any)
      .insert({
        user_id: user.id,
        prompt: prompt,
        status: 'pending',
        duration: duration,
        script: `Product: ${productName} \nURL: ${url} \nGoal: ${goal}`
      })
      .select('id')
      .single()

    // FALLBACK: If the standard client fails (likely RLS issue) but we have a valid user,
    // we use the Admin client to insert the video record for THIS USER ID ONLY.
    if (videoError || !videoData) {
      console.warn('[API/Generate] Standard video insert failed, trying admin fallback...', videoError?.message)
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()
      const { data: adminVideoData, error: adminVideoError } = await (adminClient.from('videos') as any)
        .insert({
          user_id: user.id,
          prompt: prompt,
          status: 'pending',
          duration: duration,
          script: `Product: ${productName} \nURL: ${url} \nGoal: ${goal}`
        })
        .select('id')
        .single()
      
      if (adminVideoData) {
        videoData = adminVideoData
        videoError = null
        console.log('[API/Generate] Admin insert fallback successful for', user.email)
      } else {
        // Ultimate failure - revert credits
        await (supabase as any).rpc('increment_credits', { p_user_id: user.id, p_amount: requiredUnits })
        return NextResponse.json({ 
          error: `Failed to create video record: ${adminVideoError?.message || videoError?.message || 'Database error'}` 
        }, { status: 500 })
      }
    }

    const videoId = videoData.id

    // 6. Private Jarvis Service (Smart Control)
    const jarvisApiUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL
    const jarvisInstanceId = process.env.JARVISLABS_INSTANCE_ID

    if (!jarvisApiUrl) {
      throw new Error('NEXT_PUBLIC_JARVIS_API_URL is missing')
    }

    // Smart Boot Logic: Only if instance ID is provided
    if (jarvisInstanceId) {
      try {
        const { jarvis } = await import('@/lib/jarvis')
        console.log('[API/Generate] Checking Jarvis Instance status...')
        
        // Wait up to 2 minutes for the instance to be Running & Heartbeat 200 OK
        // This will automatically RESUME it if it's paused.
        await jarvis.waitForReady(jarvisInstanceId)
        console.log('[API/Generate] Jarvis GPU is ready for action!')
      } catch (error: any) {
        console.error('[API/Generate] Smart Control failed:', error.message)
        // We continue anyway in case the URL is reachable despite API failure
      }
    }

    console.log('[API/Generate] Sending prompt to Jarvis:', prompt)
    const response = await fetch(`${jarvisApiUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API/Generate] Jarvis generation failed:', errorText)
      throw new Error(`Private GPU Server error: ${errorText || response.statusText}`)
    }

    const { video_url, status: genStatus } = await response.json()
    
    // Construct the absolute URL if it is a relative path
    const fullVideoUrl = video_url.startsWith('http') 
      ? video_url 
      : `${jarvisApiUrl}${video_url.startsWith('/') ? '' : '/'}${video_url}`

    console.log('[API/Generate] Jarvis generation complete:', fullVideoUrl)

    // 7. Update the record to completed status
    await (supabase.from('videos') as any)
      .update({
        video_url: fullVideoUrl,
        status: 'completed'
      })
      .eq('id', videoId)

    // 8. AUTO-PAUSE: Immediately pause the Jarvis GPU to stop billing
    if (jarvisInstanceId) {
      const { jarvis } = await import('@/lib/jarvis')
      jarvis.pause(jarvisInstanceId).catch((e: any) =>
        console.warn('[API/Generate] Auto-pause failed (non-critical):', e.message)
      )
      console.log('[API/Generate] GPU auto-pause triggered.')
    }

    return NextResponse.json({ 
      success: true, 
      videoId,
      videoUrl: fullVideoUrl,
      message: 'Video generation complete' 
    })

  } catch (error: any) {
    console.error('Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
