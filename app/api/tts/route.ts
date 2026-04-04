import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const jarvisApiUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL
    if (!jarvisApiUrl) {
      return NextResponse.json({ error: 'Private GPU server not configured.' }, { status: 500 })
    }

    // Call Private Jarvis Kokoro TTS
    const response = await fetch(`${jarvisApiUrl}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voice || 'af_heart' })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Jarvis Voice API error: ${errorText || response.statusText}`)
    }

    const { audio_url } = await response.json()
    const fullAudioUrl = audio_url.startsWith('http')
      ? audio_url
      : `${jarvisApiUrl}${audio_url.startsWith('/') ? '' : '/'}${audio_url}`

    // Fetch audio buffer and return it
    const audioRes = await fetch(fullAudioUrl)
    if (!audioRes.ok) throw new Error('Failed to fetch generated audio from Jarvis')

    const data = await audioRes.arrayBuffer()
    return new NextResponse(data, {
      headers: { 'Content-Type': 'audio/wav' }
    })

  } catch (err: any) {
    console.error('[API/TTS] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
