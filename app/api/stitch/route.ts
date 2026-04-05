/**
 * app/api/stitch/route.ts
 * Post-processing endpoint: merges the generated video with a Kokoro TTS voiceover.
 *
 * Flow:
 *  1. Authenticate user
 *  2. Validate inputs
 *  3. Boot Jarvislabs GPU if paused (Single Check for Serverless)
 *  4. Fetch video + generate voiceover concurrently
 *  5. Merge with FFmpeg (audio overlay)
 *  6. Return the final MP4 buffer
 *  7. Clean up temp files
 */

import { NextRequest, NextResponse } from 'next/server'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { createClient } from '@/lib/supabase/server'

// ─── Helper: Resolve relative Jarvis paths to absolute URLs ──────────────────

function toAbsoluteUrl(p: string, base: string): string {
  if (p.startsWith('http')) return p
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`
}

// ─── Route Handler ────────────────────────────────────────────────────────────
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

    // 3. Setup temp directory for FFmpeg processing
    await fs.mkdir(tempDir, { recursive: true })
    const videoPath  = path.join(tempDir, 'input.mp4')
    const audioPath  = path.join(tempDir, 'voice.wav')
    const outputPath = path.join(tempDir, 'output.mp4')

    // 4. Resolve Jarvis GPU Config
    const jarvisId    = process.env.JARVISLABS_INSTANCE_ID?.trim()
    const jarvisName  = process.env.JARVISLABS_INSTANCE_NAME?.trim()
    const jarvisIdentifier = jarvisName || jarvisId

    if (!jarvisIdentifier) {
      throw new Error('JARVISLABS_INSTANCE_NAME (or ID) environment variable is missing.')
    }

    // 5. Check GPU Readiness (Serverless-Safe check)
    let resolvedJarvisUrl: string | null = null
    try {
      resolvedJarvisUrl = await jarvis.checkReady(jarvisIdentifier)
      if (!resolvedJarvisUrl) {
         return NextResponse.json({ 
           status: 'booting', 
           message: 'GPU is warming up for post-processing...' 
         }, { status: 202 })
      }
    } catch (e: any) {
      console.warn('[Stitch] GPU readiness check failed:', e.message)
      throw new Error(`GPU Connection Failed: ${e.message}`)
    }

    // 6. Fetch Authentication Token
    const token = await jarvis.getToken(jarvisIdentifier)
    const appendToken = (url: string) => `${url}${url.includes('?') ? '&' : '?'}${token ? `token=${token}` : ''}`

    // 7. Fetch video + generate voice concurrently
    console.log(`[Stitch] Rendering voice and fetching source video...`)
    const [videoRes, voiceRes] = await Promise.all([
      fetch(videoUrl),
      fetch(appendToken(`${resolvedJarvisUrl}/voice`), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: voiceScript, voice: 'af_heart' })
      })
    ])

    if (!videoRes.ok) throw new Error(`Failed to fetch source video: ${videoRes.statusText}`)
    if (!voiceRes.ok) {
       const errText = await voiceRes.text()
       throw new Error(`Voice Engine error: ${errText || voiceRes.statusText}`)
    }

    const { audio_url } = await voiceRes.json()
    const fullAudioUrl = toAbsoluteUrl(audio_url, resolvedJarvisUrl)
    const audioRes = await fetch(appendToken(fullAudioUrl))

    if (!audioRes.ok) throw new Error(`Failed to download audio: ${audioRes.statusText}`)

    // 8. Write streams to temp files
    await Promise.all([
      fs.writeFile(videoPath, Buffer.from(await videoRes.arrayBuffer())),
      fs.writeFile(audioPath, Buffer.from(await audioRes.arrayBuffer()))
    ])

    // 9. Execute FFmpeg merge
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',    // Preserve video quality (fast)
          '-c:a aac',     // Universal audio format
          '-map 0:v:0',   // Use video from generated clip
          '-map 1:a:0',   // Use audio from TTS
          '-shortest'     // Align durations
        ])
        .on('end', () => resolve())
        .on('error', (err) => {
          console.error('[FFmpeg] Error:', err)
          reject(new Error(`FFmpeg processing failed: ${err.message}`))
        })
        .save(outputPath)
    })

    // 10. Read results and finalize
    const outputBuffer = await fs.readFile(outputPath)

    // Fire-and-forget pause call
    jarvis.safePause(jarvisIdentifier)

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type':        'video/mp4',
        'Content-Disposition': 'attachment; filename="viralugc-ad.mp4"'
      }
    })

  } catch (error: any) {
    console.error('[Stitch] Process failed:', error.message)
    
    // Attempt cleanup pause on error
    try {
      const jarvisIdentifier = process.env.JARVISLABS_INSTANCE_NAME || process.env.JARVISLABS_INSTANCE_ID
      if (jarvisIdentifier) {
        jarvis.safePause(jarvisIdentifier)
      }
    } catch (e) {}

    return NextResponse.json({ error: error.message || 'Stitching failed' }, { status: 500 })

  } finally {
    // 11. Clean up temp disk space
    fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}
