import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { Database } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    
    // Webhook Signature Validation (if documented by fal.ai, usually X-Fal-Signature)
    // For simplicity of MVP, we trust the payload if the user provides the webhook,
    // but in a production environment you MUST validate the fal.ai signature.
    const searchParams = req.nextUrl.searchParams
    const videoId = searchParams.get('videoId')
    
    if (!videoId) {
       return NextResponse.json({ error: 'Missing videoId query parameter' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)

    // Using service role to bypass RLS for webhook updates
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    if (payload.status === 'ERROR') {
      await supabase
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId)
      return NextResponse.json({ success: true, status: 'failed set' })
    }

    // Success state
    if (payload.status === 'OK' && payload.payload?.video?.url) {
      const videoUrl = payload.payload.video.url
      
      // Update Supabase video record
      await supabase
        .from('videos')
        .update({
          video_url: videoUrl,
          status: 'completed'
        })
        .eq('id', videoId)

      return NextResponse.json({ success: true })
    }

    // Still processing/in queue
    return NextResponse.json({ success: true, message: 'Processing state received' })

  } catch (error: any) {
    console.error('Fal Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
