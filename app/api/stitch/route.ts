import { NextRequest, NextResponse } from 'next/server'
import ffmpeg from 'fluent-ffmpeg'
import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `stitch-${Date.now()}`)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoUrl, voiceScript } = await req.json()

    if (!videoUrl || !voiceScript) {
      return NextResponse.json({ error: 'Missing videoUrl or voiceScript' }, { status: 400 })
    }

    // 1. Setup temp directory
    await fs.mkdir(tempDir, { recursive: true })
    const videoPath = path.join(tempDir, 'input_video.mp4')
    const audioPath = path.join(tempDir, 'input_audio.mp3')
    const outputPath = path.join(tempDir, 'output.mp4')

    // 2. Download Video and Generate TTS Audio concurrently
    const { fal, VOXTRAL_MODEL_ID } = await import('@/lib/fal')
    
    const [videoRes, ttsResult] = await Promise.all([
      axios.get(videoUrl, { responseType: 'arraybuffer' }),
      fal.subscribe(VOXTRAL_MODEL_ID, {
        input: {
          text: voiceScript,
          voice: 'am_adam'
        }
      })
    ])

    const ttsAudioUrl = (ttsResult as any).audio?.url
    if (!ttsAudioUrl) {
      throw new Error('Fal AI Voxtral-TTS failed to return audio URL')
    }

    const audioRes = await axios.get(ttsAudioUrl, { responseType: 'arraybuffer' })

    await Promise.all([
      fs.writeFile(videoPath, Buffer.from(videoRes.data)),
      fs.writeFile(audioPath, Buffer.from(audioRes.data))
    ])

    // 3. Process with FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',       // Copy video codec (fast)
          '-c:a aac',       // Re-encode audio to AAC
          '-map 0:v:0',      // Use video from first input
          '-map 1:a:0',      // Use audio from second input
          '-shortest'        // Trim to shortest duration
        ])
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg Error:', err)
          reject(err)
        })
        .save(outputPath)
    })

    // 4. Read the output file
    const outputBuffer = await fs.readFile(outputPath)

    // Optional: Upload to Supabase Storage in the background or here
    // ...

    // 5. Return the buffer
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="viralugc-ad.mp4"`,
      },
    })

  } catch (error: any) {
    console.error('[API/Stitch] Stitching Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to stitch video and audio' }, { status: 500 })
  } finally {
    // 6. Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.warn('[API/Stitch] Cleanup Error:', cleanupError)
    }
  }
}
