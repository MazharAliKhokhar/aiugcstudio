import { NextRequest, NextResponse } from 'next/server'
import { fal, VOXTRAL_MODEL_ID } from '@/lib/fal'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!process.env.FAL_KEY) {
      console.error('Missing FAL_KEY')
      return NextResponse.json({ error: 'AI services are not fully configured.' }, { status: 500 })
    }

    // Call Fal AI Voxtral-TTS
    const result: any = await fal.subscribe(VOXTRAL_MODEL_ID, {
      input: {
        text,
        voice: 'am_adam' // Using the Open Source 'Adam' equivalent in Mistral's voice set
      },
    })

    if (!result.audio?.url) {
      console.error('Fal AI Error: No audio URL returned', result)
      return NextResponse.json({ error: 'Failed to generate audio via Voxtral' }, { status: 500 })
    }

    // Fetch the audio from the generated URL to return as a buffer
    const audioRes = await fetch(result.audio.url)
    if (!audioRes.ok) {
      throw new Error('Failed to fetch generated audio from Fal storage')
    }

    const data = await audioRes.arrayBuffer()
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
