'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { DurationToggle } from './DurationToggle'
import { getCreditCost } from '@/lib/credits'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

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
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-sm">
        <DurationToggle duration={duration} setDuration={setDuration} />
      </div>

      {!hasEnoughCredits && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600 rounded-lg p-2 shadow-sm">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="font-black uppercase tracking-tight text-[9px] ml-1.5">
            Insufficient units for a {duration}s video. You have {creditsAvailable} units, but need {cost}. 
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 pt-1">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="w-24 h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase italic tracking-tighter transition-all" 
          disabled={isGenerating}
        >
          <ArrowLeft className="mr-1.5 w-3.5 h-3.5" /> Back
        </Button>
        
        <Button 
          onClick={onGenerate} 
          className="flex-1 h-10 text-base font-[1000] uppercase tracking-tighter rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 transition-all group overflow-hidden text-white border-0"
          disabled={isGenerating || !hasEnoughCredits}
        >
          {isGenerating ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[10px]">Initializing Render...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
              <span>SUBMIT & RENDER — {cost} UNIT{cost > 1 ? 'S' : ''}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
