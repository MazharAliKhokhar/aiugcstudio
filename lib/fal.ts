import { fal } from '@fal-ai/client'

// Configure the client
fal.config({
  credentials: process.env.FAL_KEY,
})

export { fal }

export const KLING_MODEL_ID = 'fal-ai/kling-video/v1.5/pro/text-to-video'

export interface KlingInput {
  prompt: string
  duration?: '5' | '10' // Note: Kling v1.5 API supports '5' or '10' string values usually. We'll map UI durations to what the API supports.
  aspect_ratio?: '16:9' | '9:16' | '1:1'
}
