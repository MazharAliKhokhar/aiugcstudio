'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Wand2, Sparkles, Mic } from 'lucide-react'

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt-script" className="text-sm font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Visual Scripting
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/20 rounded-full px-3" 
              onClick={() => setPrompt(prompt + ' Make it more energetic and high-contrast.')}
            >
              <Wand2 className="w-3 h-3 mr-1.5" />
              Optimize Prompt
            </Button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Textarea
              id="prompt-script"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scenes visually..."
              className="relative min-h-[160px] bg-black/40 border-white/10 rounded-2xl p-5 text-base leading-relaxed resize-none focus-visible:ring-primary/40 scrollbar-hide"
            />
          </div>
          <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
            Used by Kling 2.1 to generate photorealistic video frames.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-script" className="text-sm font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> AI Voiceover Copy
            </Label>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Textarea
              id="voice-script"
              value={voiceScript}
              onChange={(e) => setVoiceScript(e.target.value)}
              placeholder="Type what the AI should say..."
              className="relative min-h-[100px] bg-black/40 border-white/10 rounded-2xl p-5 text-base leading-relaxed resize-none focus-visible:ring-primary/40"
            />
          </div>
          <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
            Generated via ElevenLabs Multilingual v2 engine.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="w-32 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 h-14 text-lg font-black uppercase tracking-tighter rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all" disabled={!prompt.trim()}>
          Next: Render Ad <ArrowRight className="ml-3 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
