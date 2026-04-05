'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DURATION_CREDIT_COSTS } from '@/lib/credits'
import { Coins, Clock } from 'lucide-react'

interface DurationToggleProps {
  duration: number
  setDuration: (duration: number) => void
}

export function DurationToggle({ duration, setDuration }: DurationToggleProps) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Select video duration</Label>
      <RadioGroup
        value={duration.toString()}
        onValueChange={(val) => setDuration(parseInt(val))}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[15, 30, 45, 60].map((d) => (
          <div key={d} className="relative group">
            <RadioGroupItem value={d.toString()} id={`duration-${d}`} className="peer sr-only" />
            <Label
              htmlFor={`duration-${d}`}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 hover:border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-primary/20 cursor-pointer transition-all gap-2 relative overflow-hidden shadow-sm group/btn"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12 peer-data-[state=checked]:bg-primary/20 transition-colors" />
              <Clock className="w-6 h-6 text-primary peer-data-[state=checked]:scale-110 transition-transform" />
              <span className="font-[1000] text-2xl md:text-3xl text-slate-900 italic tracking-tighter peer-data-[state=checked]:text-primary transition-colors">{d}s</span>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 peer-data-[state=checked]:text-slate-600 transition-colors">
                <Coins className="w-4 h-4 text-primary" />
                {DURATION_CREDIT_COSTS[d]} Units
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
