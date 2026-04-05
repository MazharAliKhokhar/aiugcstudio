'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DURATION_CREDIT_COSTS } from '@/lib/credits'
import { Coins, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DurationToggleProps {
  duration: number
  setDuration: (duration: number) => void
}

export function DurationToggle({ duration, setDuration }: DurationToggleProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Select video duration</Label>
      <RadioGroup
        value={duration.toString()}
        onValueChange={(val) => setDuration(parseInt(val))}
        className="grid grid-cols-2 md:grid-cols-4 gap-2"
      >
        {[15, 30, 45, 60].map((d) => {
          const isSelected = duration === d;
          return (
            <div key={d} className="relative group">
              <RadioGroupItem value={d.toString()} id={`duration-${d}`} className="peer sr-only" />
              <Label
                htmlFor={`duration-${d}`}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 p-2 cursor-pointer transition-all gap-0.5 relative overflow-hidden shadow-sm group/btn",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-xl shadow-primary/10" 
                    : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                )}
              >
                <div className={cn(
                  "absolute top-0 right-0 w-16 h-16 blur-2xl rounded-full translate-x-8 -translate-y-8 transition-colors",
                  isSelected ? "bg-primary/20" : "bg-primary/5"
                )} />
                <Clock className={cn("w-4 h-4 transition-transform", isSelected ? "text-primary scale-110" : "text-slate-400")} />
                <span className={cn("font-[1000] text-lg md:text-xl italic tracking-tighter transition-colors", isSelected ? "text-primary" : "text-slate-900")}>{d}s</span>
                <span className={cn("text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors", isSelected ? "text-slate-600" : "text-slate-400")}>
                  <Coins className={cn("w-3 h-3", isSelected ? "text-primary" : "text-slate-300")} />
                  {DURATION_CREDIT_COSTS[d]} Units
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  )
}
