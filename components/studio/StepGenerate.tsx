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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-6 shadow-sm">
        <DurationToggle duration={duration} setDuration={setDuration} />
      </div>

      {!hasEnoughCredits && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600 rounded-2xl p-4 shadow-xl shadow-red-500/5">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-black uppercase tracking-tight text-base ml-2">
            Insufficient units for a {duration}s video. You have {creditsAvailable} units, but need {cost}. 
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="w-32 h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase italic tracking-tighter transition-all" 
          disabled={isGenerating}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        
        <Button 
          onClick={onGenerate} 
          className="flex-1 h-14 text-xl font-[1000] uppercase tracking-tighter rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 transition-all group overflow-hidden text-white border-0"
          disabled={isGenerating || !hasEnoughCredits}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Initializing Ad Generation...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
              <span>SUBMIT & RENDER — {cost} UNIT{cost > 1 ? 'S' : ''}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
