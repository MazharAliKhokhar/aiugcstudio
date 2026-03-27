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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
        <DurationToggle duration={duration} setDuration={setDuration} />
      </div>

      {!hasEnoughCredits && (
        <Alert variant="destructive" className="bg-red-500/5 border-red-500/10 text-red-600 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Insufficient units for a {duration}s video. You have {creditsAvailable} units, but need {cost}. 
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="w-32 h-14 rounded-2xl border-black/5 bg-white hover:bg-black/5 text-foreground font-bold shadow-sm" 
          disabled={isGenerating}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        
        <Button 
          onClick={onGenerate} 
          className="flex-1 h-14 text-lg font-[1000] uppercase tracking-tighter rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/20 transition-all group overflow-hidden text-white"
          disabled={isGenerating || !hasEnoughCredits}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Initializing Ad Generation...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span>Submit & Render — {cost} Unit{cost > 1 ? 's' : ''}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
