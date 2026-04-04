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
    const jarvisApiUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL
    if (!jarvisApiUrl) {
      throw new Error('JARVIS_API_URL is missing in environment variables')
    }

    console.log('[API/Stitch] Requesting video from:', videoUrl)
    console.log('[API/Stitch] Requesting voiceover from Jarvis...')

    const [videoRes, voiceRes] = await Promise.all([
      axios.get(videoUrl, { responseType: 'arraybuffer' }),
      fetch(`${jarvisApiUrl}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: voiceScript,
          voice: 'af_heart' // Best open-source voice
        })
      })
    ])

    if (!voiceRes.ok) {
      const errorText = await voiceRes.text()
      throw new Error(`Jarvis Voice API failed: ${errorText || voiceRes.statusText}`)
    }

    const { audio_url } = await voiceRes.json()
    const fullAudioUrl = audio_url.startsWith('http') 
      ? audio_url 
      : `${jarvisApiUrl}${audio_url.startsWith('/') ? '' : '/'}${audio_url}`

    const audioRes = await axios.get(fullAudioUrl, { responseType: 'arraybuffer' })

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
