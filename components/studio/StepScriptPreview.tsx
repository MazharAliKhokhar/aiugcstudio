'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Wand2, Sparkles, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepScriptPreviewProps {
  prompt: string
  setPrompt: (val: string) => void
  voiceScript: string
  setVoiceScript: (val: string) => void
  onNext: () => void
  onBack: () => void
  isScripting?: boolean
}

export function StepScriptPreview({ prompt, setPrompt, voiceScript, setVoiceScript, onNext, onBack, isScripting }: StepScriptPreviewProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt-script" className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Visual Prompt Scripting
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/20 rounded-2xl px-4" 
              onClick={() => setPrompt(prompt + ' Make it more cinematic, 4k, bright colors.')}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Tune Prompt
            </Button>
          </div>
          
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Textarea
              id="prompt-script"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scenes visually..."
              className="relative min-h-[120px] bg-slate-50 border-slate-200 rounded-xl p-3 text-sm leading-relaxed resize-none focus-visible:ring-primary/40 scrollbar-hide text-slate-900 shadow-sm font-medium"
            />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Used by Wan 2.1 to generate photorealistic video frames.
            </h4>
            <span className={cn("text-xs font-black", prompt.length > 450 ? "text-red-500" : "text-slate-300")}>
              {prompt.length}/500
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-script" className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" /> AI Voiceover Copy
            </Label>
          </div>
          
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Textarea
              id="voice-script"
              value={voiceScript}
              onChange={(e) => setVoiceScript(e.target.value)}
              placeholder="What should the AI actor say?"
              className="relative min-h-[80px] bg-slate-50 border-slate-200 rounded-xl p-3 text-sm leading-relaxed resize-none focus-visible:ring-primary/40 text-slate-900 shadow-sm font-medium"
              maxLength={1000}
            />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Powered by ElevenLabs high-fidelity engine.
            </h4>
            <span className={cn("text-xs font-black", voiceScript.length > 500 ? "text-orange-500" : "text-slate-300")}>
              {voiceScript.length}/1000
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 mt-auto">
        <Button variant="outline" onClick={onBack} className="w-28 h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase italic tracking-tighter transition-all">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1 h-11 text-base font-black uppercase tracking-tighter rounded-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all disabled:opacity-50 disabled:grayscale text-white border-0" 
          disabled={!prompt.trim() || !voiceScript.trim() || isScripting}
        >
          {isScripting ? 'AI Scripting...' : 'Final: Render Ad'} <ArrowRight className="ml-4 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
