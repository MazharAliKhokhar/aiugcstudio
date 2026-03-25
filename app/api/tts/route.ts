import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('Missing ELEVENLABS_API_KEY')
      return NextResponse.json({ error: 'TTS is not configured.' }, { status: 500 })
    }

    // Adam voice ID is pNInz6obpgDQGcFmaJcg
    const VOICE_ID = 'pNInz6obpgDQGcFmaJcg' 

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('ElevenLabs Error:', errText)
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
    }

    // Return the audio buffer directly so the client can use it
    const data = await response.arrayBuffer()
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })

  } catch (err: any) {
    console.error('TTS Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
