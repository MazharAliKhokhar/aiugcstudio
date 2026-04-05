import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ScriptRequestSchema = z.object({
  url: z.string().url(),
  productName: z.string().optional().or(z.literal('')),
  goal: z.string().optional().default('sales'),
  actorDescription: z.string().optional().default('professional UGC creator')
})

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 })
    }

    const body = await req.json()
    const validated = ScriptRequestSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.format() }, { status: 400 })
    }

    const { url, productName, goal, actorDescription } = validated.data

    const systemPrompt = `You are an expert UGC (User Generated Content) scriptwriter and video prompt engineer. 
Your goal is to create a high-converting script and video prompt for a viral ad.

INPUTS:
- Product: ${productName}
- URL: ${url}
- Marketing Goal: ${goal}
- Actor: ${actorDescription}

OUTPUT FORMAT:
You must return a JSON object with exactly two fields:
1. "videoPrompt": A detailed, cinematic visual description (50-100 words) optimized for Wan 2.1 (T2V). Focus on lighting, camera movement (e.g., "high-quality cinematic tracking shot", "bokeh background"), and the actor's actions matching the UGC style.
2. "voiceoverScript": A 15-30 second high-energy spoken script (40-70 words) optimized for Voxtral (Mistral TTS). Use natural, persuasive language, hooks, and a strong call to action suitable for social media ads.

Keep the tone modern, professional, and visually stunning. 
Do not include any other text in your response, ONLY the JSON object.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          { role: 'system', content: 'You are a professional ad scriptwriter. Always respond with pure JSON.' },
          { role: 'user', content: systemPrompt }
        ],
        response_format: { type: 'json_object' },
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API Error:', errorText)
      throw new Error(`DeepSeek API failed: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON content from DeepSeek
    try {
      const result = JSON.parse(content)
      return NextResponse.json(result)
    } catch {
      console.error('Failed to parse DeepSeek response as JSON:', content)
      return NextResponse.json({ 
        error: 'AI generated invalid format', 
        raw: content.substring(0, 500) 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Script Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
