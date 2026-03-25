'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { DurationToggle } from './DurationToggle'
import { getCreditCost } from '@/lib/credits'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StepGenerateProps {
  duration: number
  setDuration: (val: number) => void
  isGenerating: boolean
  onGenerate: () => void
  onBack: () => void
  creditsAvailable: number
  voiceScript?: string
  videoUrl?: string | null
  setVideoUrl?: (val: string | null) => void
  videoStatus?: 'pending'|'processing'|'completed'|'failed'|null
}

export function StepGenerate({ duration, setDuration, isGenerating, onGenerate, onBack, creditsAvailable, voiceScript, videoUrl, setVideoUrl, videoStatus }: StepGenerateProps) {
  const cost = getCreditCost(duration)
  const hasEnoughCredits = creditsAvailable >= cost

  return (
    <div className="space-y-8">
      
      <DurationToggle duration={duration} setDuration={setDuration} />

      {!hasEnoughCredits && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have enough credits for a {duration}s video. You have {creditsAvailable} credits, but need {cost}. Please top up on the Settings page.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="w-32 h-14" disabled={isGenerating}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        
        <Button 
          onClick={onGenerate} 
          className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/25 relative overflow-hidden group"
          disabled={isGenerating || !hasEnoughCredits}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Initializing Generator...
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Video Ad — Pay {cost} Credit{cost > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
