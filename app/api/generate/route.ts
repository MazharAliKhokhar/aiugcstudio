import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCreditCost } from '@/lib/credits'
import { fal, KLING_MODEL_ID } from '@/lib/fal'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, productName, goal, prompt, duration } = await req.json()

    if (!prompt || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const requiredUnits = getCreditCost(duration)

    // 1. Atomically check and deduct credits via Postgres RPC
    const { data: newBalance, error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: requiredUnits
    })

    if (deductError) {
      console.error('Unit deduction RPC error:', deductError)
      return NextResponse.json({ error: 'Failed to deduct units' }, { status: 500 })
    }

    if (newBalance === -1) {
      return NextResponse.json({ error: 'Insufficient units' }, { status: 402 })
    }

    // 2. Insert pending video row
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        prompt: prompt,
        status: 'pending',
        duration: duration,
        script: productName ? `Product: ${productName} \nURL: ${url} \nGoal: ${goal}` : null
      })
      .select('id')
      .single()

    if (videoError || !videoData) {
      // Revert units atomically
      await supabase.rpc('increment_credits', { p_user_id: user.id, p_amount: requiredUnits })
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 })
    }

    const videoId = videoData.id

    // 3. Submit to fal.ai (async) using the videoId to track it
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/fal?videoId=${videoId}`

    // Map duration integer to string allowed for Kling
    const klingDuration = duration >= 10 ? '10' : '5'

    const falResult = await fal.queue.submit(KLING_MODEL_ID, {
      input: {
        prompt,
        duration: klingDuration,
        aspect_ratio: '9:16' // Shorts/TikTok format
      },
      webhookUrl: webhookUrl
    })

    // 4. Update the record with the fal.ai job ID and status
    await supabase
      .from('videos')
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
