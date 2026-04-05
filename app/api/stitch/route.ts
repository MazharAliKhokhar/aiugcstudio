/**
 * app/api/stitch/route.ts
 * Post-processing endpoint: merges the generated video with a Kokoro TTS voiceover.
 *
 * Flow:
 *  1. Authenticate user
 *  2. Validate inputs
 *  3. Boot Jarvislabs GPU if paused
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

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `stitch-${Date.now()}`)

  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Input Validation
    const { videoUrl, voiceScript } = await req.json()
    if (!videoUrl || !voiceScript) {
      return NextResponse.json({ error: 'Missing videoUrl or voiceScript' }, { status: 400 })
    }
    if (typeof voiceScript !== 'string' || voiceScript.length > 5000) {
      return NextResponse.json({ error: 'voiceScript must be a string under 5000 chars' }, { status: 400 })
    }

    // 3. Setup temp directory for FFmpeg processing
    await fs.mkdir(tempDir, { recursive: true })
    const videoPath  = path.join(tempDir, 'input.mp4')
    const audioPath  = path.join(tempDir, 'voice.wav')
    const outputPath = path.join(tempDir, 'output.mp4')

    // 4. Verify Jarvis config
    const jarvisId    = process.env.JARVISLABS_INSTANCE_ID?.trim()
    const jarvisName  = process.env.JARVISLABS_INSTANCE_NAME?.trim()
    const jarvisKey   = process.env.JARVISLABS_API_KEY?.trim()

    // Use name as primary identifier if available, fallback to ID
    const jarvisIdentifier = jarvisName || jarvisId

    if (!jarvisIdentifier || !jarvisKey) {
      throw new Error('Missing JARVISLABS_API_KEY or JARVISLABS_INSTANCE_NAME (or ID)')
    }

    let resolvedJarvisUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL || ''

    // Boot GPU if paused and resolve the latest proxy URL
    try {
      const { jarvis } = await import('@/lib/jarvis')
      resolvedJarvisUrl = await jarvis.waitForReady(jarvisIdentifier)
    } catch (e: any) {
      console.warn('[Stitch] GPU readiness check failed:', e.message)
      if (!resolvedJarvisUrl) throw new Error(`GPU is not ready and no fallback URL is available: ${e.message}`)
    }

    // 5a. Fetch video + generate voice concurrently to save time
    const [videoRes, voiceRes] = await Promise.all([
      fetch(videoUrl),
      fetch(`${resolvedJarvisUrl}/voice`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: voiceScript, voice: 'af_heart' }) // Kokoro voice
      })
    ])

    if (!videoRes.ok)  throw new Error(`Failed to fetch video: ${videoRes.statusText}`)
    if (!voiceRes.ok)  throw new Error(`Jarvis Voice API error: ${await voiceRes.text()}`)

    const { audio_url } = await voiceRes.json()
    const fullAudioUrl = toAbsoluteUrl(audio_url, resolvedJarvisUrl)

    const audioRes = await fetch(fullAudioUrl)
    if (!audioRes.ok) throw new Error(`Failed to download audio from Jarvis: ${audioRes.statusText}`)

    // 5b. Write both files to temp disk
    await Promise.all([
      fs.writeFile(videoPath, Buffer.from(await videoRes.arrayBuffer())),
      fs.writeFile(audioPath, Buffer.from(await audioRes.arrayBuffer()))
    ])

    // 5c. Merge video + audio with FFmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',    // Copy video stream as-is (fast, no re-encode)
          '-c:a aac',     // Re-encode audio to AAC for broad compatibility
          '-map 0:v:0',   // Use video from first input
          '-map 1:a:0',   // Use audio from second input
          '-shortest'     // Trim to the shorter of the two streams
        ])
        .on('end', () => resolve())
        .on('error', reject)
        .save(outputPath)
    })

    // 6. Read and return the final stitched video
    const outputBuffer = await fs.readFile(outputPath)

    // 7. Auto-Pause (Fire-and-forget cleanup)
    const { jarvis } = await import('@/lib/jarvis')
    jarvis.safePause(jarvisIdentifier)

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type':        'video/mp4',
        'Content-Disposition': 'attachment; filename="viralugc-ad.mp4"'
      }
    })

  } catch (error: any) {
    console.error('[Stitch] Error:', error)
    // Also pause on error if we had a jarvisIdentifier
    try {
      const jarvisId    = process.env.JARVISLABS_INSTANCE_ID?.trim()
      const jarvisName  = process.env.JARVISLABS_INSTANCE_NAME?.trim()
      const jarvisIdentifier = jarvisName || jarvisId
      if (jarvisIdentifier) {
        const { jarvis } = await import('@/lib/jarvis')
        jarvis.safePause(jarvisIdentifier)
      }
    } catch (e) {}

    return NextResponse.json({ error: error.message || 'Stitching failed' }, { status: 500 })

  } finally {
    // 8. Always clean up temp files to avoid disk accumulation
    fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}
