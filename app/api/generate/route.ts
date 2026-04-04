import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCreditCost } from '@/lib/credits'
import { fal, WAN_MODEL_ID } from '@/lib/fal'
import { z } from 'zod'

// 1. Define Input Schema for Guardrails
const GenerateSchema = z.object({
  url: z.string().url().max(500),
  productName: z.string().max(100).optional().or(z.literal('')),
  goal: z.enum(['sales', 'awareness', 'retargeting']),
  prompt: z.string().min(10).max(1000),
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
    const { data: videoData, error: videoError } = await (supabase.from('videos') as any)
      .insert({
        user_id: user.id,
        prompt: prompt,
        status: 'pending',
        duration: duration,
        script: `Product: ${productName} \nURL: ${url} \nGoal: ${goal}`
      })
      .select('id')
      .single()

    if (videoError || !videoData) {
      // Revert units atomically
      await (supabase as any).rpc('increment_credits', { p_user_id: user.id, p_amount: requiredUnits })
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 })
    }

    const videoId = videoData.id

    // 6. Submit to fal.ai (async) 
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/fal?videoId=${videoId}`

    const falResult = await fal.queue.submit(WAN_MODEL_ID, {
      input: {
        prompt,
        aspect_ratio: '9:16'
      },
      webhookUrl: webhookUrl
    })

    // 7. Update the record with the fal.ai job ID
    await (supabase.from('videos') as any)
      .update({
        fal_job_id: falResult.request_id,
        status: 'processing'
      })
      .eq('id', videoId)

    return NextResponse.json({ 
      success: true, 
      videoId,
      message: 'Video generation started' 
    })

  } catch (error: any) {
    console.error('Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
