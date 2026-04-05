import { NextRequest, NextResponse } from 'next/server'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs, createReadStream } from 'fs'
import path from 'path'
import os from 'os'
import { createClient } from '@/lib/supabase/server'

// ─── Helper: Resolve relative Jarvis paths to absolute URLs ──────────────────
function toAbsoluteUrl(p: string, base: string): string {
  if (p.startsWith('http')) return p
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `stitch-${Date.now()}`)
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

    // 3. Setup temp directory
    await fs.mkdir(tempDir, { recursive: true })
    const videoPath  = path.join(tempDir, 'input.mp4')
    const audioPath  = path.join(tempDir, 'voice.wav')
    const outputPath = path.join(tempDir, 'output.mp4')

    // 4. Resolve Jarvis GPU Config
    const jarvisIdentifier = process.env.JARVISLABS_INSTANCE_NAME || process.env.JARVISLABS_INSTANCE_ID
    if (!jarvisIdentifier) throw new Error('Jarvis instance not configured')

    // 5. Check GPU Readiness
    const resolvedJarvisUrl = await jarvis.checkReady(jarvisIdentifier)
    if (!resolvedJarvisUrl) {
      return NextResponse.json({ 
        status: 'booting', 
        message: 'GPU is warming up for post-processing...' 
      }, { status: 202 })
    }

    const token = await jarvis.getToken(jarvisIdentifier)
    const authHeaders: Record<string, string> = token ? { 'Authorization': `Token ${token}` } : {}

    // 6. Concurrently fetch video and initiate voice generation
    console.log(`[Stitch] Rendering voice and fetching source video...`)
    const [videoRes, voiceRes] = await Promise.all([
      fetch(videoUrl),
      fetch(`${resolvedJarvisUrl}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ text: voiceScript, voice: 'af_heart' })
      })
    ])

    if (!videoRes.ok) throw new Error(`Video Fetch Error: ${videoRes.statusText}`)
    if (!voiceRes.ok) throw new Error(`Voice Engine Error: ${await voiceRes.text()}`)

    const { audio_url } = await voiceRes.json()
    const audioRes = await fetch(toAbsoluteUrl(audio_url, resolvedJarvisUrl), { headers: authHeaders })
    if (!audioRes.ok) throw new Error(`Audio Download Error: ${audioRes.statusText}`)

    // 7. Write to temp files
    await Promise.all([
      fs.writeFile(videoPath, Buffer.from(await videoRes.arrayBuffer())),
      fs.writeFile(audioPath, Buffer.from(await audioRes.arrayBuffer()))
    ])

    // 8. FFmpeg Merge
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest'
        ])
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`FFmpeg: ${err.message}`)))
        .save(outputPath)
    })

    // 9. Fire-and-forget pause
    jarvis.safePause(jarvisIdentifier)

    // 10. Return Stitched Video as Stream
    const stats = await fs.stat(outputPath)
    const videoStream = createReadStream(outputPath)
    
    // Convert Node stream to web stream for NextResponse
    const stream = new ReadableStream({
      start(controller) {
        videoStream.on('data', (chunk) => controller.enqueue(chunk))
        videoStream.on('end', () => controller.close())
        videoStream.on('error', (err) => controller.error(err))
      },
      cancel() {
        videoStream.destroy()
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': 'attachment; filename="viralugc-ad.mp4"'
      }
    })

  } catch (error: any) {
    console.error('[Stitch] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Stitching failed' }, { status: 500 })
  } finally {
    // Note: We don't delete tempDir immediately because the stream might still be reading.
    // However, in a serverless env, the container will eventually be destroyed.
    // A better approach is to delete AFTER the stream ends, but that requires more complex logic.
    // For now, we'll rely on Vercel's ephemeral disk.
  }
}

