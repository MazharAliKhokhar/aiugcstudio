import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'


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

    // Using admin client to bypass RLS
    const supabase = createAdminClient()

    if (payload.status === 'ERROR') {
      await (supabase.from('videos') as any)
        .update({ status: 'failed' })
        .eq('id', videoId)
      return NextResponse.json({ success: true, status: 'failed set' })
    }

    // Success state
    if (payload.status === 'OK' && payload.payload?.video?.url) {
      const videoUrl = payload.payload.video.url
      
      // Update Supabase video record
      await (supabase.from('videos') as any)
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
