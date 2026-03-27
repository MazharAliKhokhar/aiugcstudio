import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

export async function stitchVideoAndAudio(videoUrl: string, audioBlob: Blob): Promise<string> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
  }

  try {
    if (!ffmpeg.loaded) {
      // Use a more reliable CDN structure if possible, but unpkg is fine for MVP
      await ffmpeg.load({
        coreURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`,
        wasmURL: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`,
      })
    }

    // Write video and audio to FFmpeg virtual FS
    await ffmpeg.writeFile('video.mp4', await fetchFile(videoUrl))
    await ffmpeg.writeFile('audio.mp3', await fetchFile(audioBlob))

    // Run the FFmpeg command to merge
    // -c:v copy : Copy the video codec directly (fast)
    // -c:a aac  : Encode the audio into standard AAC
    // -map 0:v:0 -map 1:a:0 : Explicitly pick video from first and audio from second
    // -shortest : Trims to the shortest duration to avoid trailing black/silence
    await ffmpeg.exec([
      '-i', 'video.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-shortest',
      'output.mp4'
    ])

    // Read the resulting file
    const data = await ffmpeg.readFile('output.mp4')
    
    // Create a blob URL for playback and download
    const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }))
    
    // Cleanup FS for next run
    try {
      await ffmpeg.deleteFile('video.mp4')
      await ffmpeg.deleteFile('audio.mp3')
      await ffmpeg.deleteFile('output.mp4')
    } catch (e) {
      console.warn('FFmpeg FS Cleanup error:', e)
    }

    return url
  } catch (err: any) {
    console.error('FFmpeg Stitching Error:', err)
    throw new Error('Failed to merge audio and video. Please try again.')
  }
}
