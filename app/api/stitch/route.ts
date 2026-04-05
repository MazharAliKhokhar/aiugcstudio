import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { jarvis } = await import('@/lib/jarvis')

  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Input Validation
    const { videoUrl, voiceScript, videoId } = await req.json()
    if (!videoUrl || !voiceScript) {
      return NextResponse.json({ error: 'Missing videoUrl or voiceScript' }, { status: 400 })
    }

    // 3. Resolve Jarvis GPU Config
    const jarvisIdentifier = process.env.JARVISLABS_INSTANCE_NAME || process.env.JARVISLABS_INSTANCE_ID
    if (!jarvisIdentifier) throw new Error('Jarvis instance not configured')

    // 4. Check GPU Readiness
    const resolvedJarvisUrl = await jarvis.checkReady(jarvisIdentifier)
    if (!resolvedJarvisUrl) {
      return NextResponse.json({ 
        status: 'booting', 
        message: 'GPU is warming up for post-processing...' 
      }, { status: 202 })
    }

    const token = await jarvis.getToken(jarvisIdentifier)
    const authHeaders: Record<string, string> = token ? { 'Authorization': `Token ${token}` } : {}

    // 5. STEP ONE: Generate Voice on GPU
    console.log(`[Stitch] Delegating Voice Generation to GPU...`)
    const voiceRes = await fetch(`${resolvedJarvisUrl}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ text: voiceScript, voice: 'af_heart' })
    })

    if (!voiceRes.ok) throw new Error(`Voice Engine Error: ${await voiceRes.text()}`)
    const { audio_url } = await voiceRes.json()

    // 6. STEP TWO: Delegate High-Speed Mastering to GPU (Local FFmpeg)
    console.log(`[Stitch] Delegating Video Mastering to GPU FFmpeg...`)
    const masterRes = await fetch(`${resolvedJarvisUrl}/stitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ 
        video_url: videoUrl, 
        audio_url: audio_url,
        video_id: videoId 
      })
    })

    if (!masterRes.ok) throw new Error(`Mastering Engine Error: ${await masterRes.text()}`)
    const { video_url: finalVideoPath } = await masterRes.json()

    // 7. Resolve the final Absolute URL for the GPU output
    const absoluteFinalUrl = `${resolvedJarvisUrl}${finalVideoPath.startsWith('/') ? '' : '/'}${finalVideoPath}`
    
    // 8. Stream the final file back to the user
    const finalFileRes = await fetch(absoluteFinalUrl, { headers: authHeaders })
    if (!finalFileRes.ok) throw new Error(`Final Ad Download Error: ${finalFileRes.statusText}`)

    const stats = finalFileRes.headers.get('content-length')
    
    return new NextResponse(finalFileRes.body, {
      headers: {
        'Content-Type': 'video/mp4',
        ...(stats && { 'Content-Length': stats }),
        'Content-Disposition': 'attachment; filename="viralugc-ad.mp4"'
      }
    })

  } catch (error: any) {
    console.error('[Stitch] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Stitching failed' }, { status: 500 })
  }
}
