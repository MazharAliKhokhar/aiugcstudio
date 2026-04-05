'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Zap, Target, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepDurationProps {
  duration: number
  setDuration: (duration: number) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS = [
  { 
    value: 15, 
    label: '15s', 
    credits: 1, 
    desc: 'Perfect for TikTok & Reels',
    icon: Zap,
    color: 'bg-amber-500',
    borderColor: 'border-amber-200'
  },
  { 
    value: 30, 
    label: '30s', 
    credits: 2, 
    desc: 'Standard Video Ad',
    icon: Target,
    color: 'bg-primary',
    borderColor: 'border-primary/20'
  },
  { 
    value: 45, 
    label: '45s', 
    credits: 3, 
    desc: 'Detailed Product Story',
    icon: Sparkles,
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-200'
  },
  { 
    value: 60, 
    label: '60s', 
    credits: 4, 
    desc: 'Full Cinematic Experience',
    icon: TrendingUp,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-200'
  }
]

export function StepDuration({ duration, setDuration, onNext, onBack }: StepDurationProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDuration(opt.value)}
            className={cn(
              "relative group p-4 rounded-[24px] border-2 text-left transition-all duration-300",
              duration === opt.value 
                ? "bg-white border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/5 scale-[1.02]" 
                : "bg-slate-50 border-slate-100 hover:border-slate-200 opacity-70 hover:opacity-100"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-12",
                opt.color
              )}>
                <opt.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                    {opt.label}
                  </span>
                  <div className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-black uppercase text-white leading-none">
                    {opt.credits} UNIT
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tight truncate">
                  {opt.desc}
                </p>
              </div>
            </div>
            
            {duration === opt.value && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <Clock className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="h-14 md:h-16 rounded-[20px] md:rounded-[24px] px-8 text-[12px] md:text-[13px] font-black uppercase italic tracking-widest border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all"
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 h-14 md:h-16 rounded-[20px] md:rounded-[24px] text-[13px] md:text-[14px] font-black uppercase italic tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Confirm Time & Next Step
        </Button>
      </div>
    </div>
  )
}
