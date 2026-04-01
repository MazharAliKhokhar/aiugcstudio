import { fal } from '@fal-ai/client'

// Configure the client
fal.config({
  credentials: process.env.FAL_KEY,
})

export { fal }

export const WAN_MODEL_ID = 'fal-ai/wan/v2.1/t2v-14b'
export const VOXTRAL_MODEL_ID = 'fal-ai/mistral-voxtral-tts' 

export interface WanInput {
  prompt: string
  aspect_ratio?: '9:16' | '16:9' | '1:1'
  resolution?: '720p' | '1080p'
}

export interface VoxtralInput {
  text: string
  voice_reference?: string // URL to 3-10s audio for cloning
  voice?: string // Pre-set voice ID if not cloning
}
