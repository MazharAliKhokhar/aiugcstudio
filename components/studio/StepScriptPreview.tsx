'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react'

interface StepScriptPreviewProps {
  prompt: string
  setPrompt: (val: string) => void
  voiceScript: string
  setVoiceScript: (val: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepScriptPreview({ prompt, setPrompt, voiceScript, setVoiceScript, onNext, onBack }: StepScriptPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt-script" className="text-base font-semibold">AI Video Prompt Script</Label>
          <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => setPrompt(prompt + ' Make it more energetic.')}>
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Enhance
          </Button>
        </div>
        
        <Textarea
          id="prompt-script"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video scene visually. Be specific about the action, lighting, and mood."
          className="min-h-[200px] text-base leading-relaxed resize-none p-4"
        />
        <p className="text-sm text-muted-foreground">
          This is the prompt that will be sent to the Kling 2.1 video generation model. You can edit it manually above to add specific visual details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-script" className="text-base font-semibold">AI Voiceover Script</Label>
        </div>
        
        <Textarea
          id="voice-script"
          value={voiceScript}
          onChange={(e) => setVoiceScript(e.target.value)}
          placeholder="Type what the AI voice should say during the ad..."
          className="min-h-[100px] text-base leading-relaxed resize-none p-4"
        />
        <p className="text-sm text-muted-foreground">
          This script will be spoken by a realistic ElevenLabs AI voice and layered over your generated video.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="w-32 h-12">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 h-12 text-md" disabled={!prompt.trim()}>
          Review & Generate <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
