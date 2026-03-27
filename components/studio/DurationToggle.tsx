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
    <div className="space-y-4">
      <Label className="text-sm font-black uppercase tracking-widest text-white/50 mb-4 block">Select duration</Label>
      <RadioGroup
        value={duration.toString()}
        onValueChange={(val) => setDuration(parseInt(val))}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[15, 30, 60].map((d) => (
          <div key={d} className="relative group">
            <RadioGroupItem value={d.toString()} id={`duration-${d}`} className="peer sr-only" />
            <Label
              htmlFor={`duration-${d}`}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-primary/10 cursor-pointer transition-all gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl rounded-full translate-x-8 -translate-y-8 peer-data-[state=checked]:bg-primary/20 transition-colors" />
              <Clock className="w-5 h-5 text-primary/70" />
              <span className="font-black text-2xl text-white italic tracking-tighter">{d}s</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                <Coins className="w-3 h-3 text-primary" />
                {DURATION_CREDIT_COSTS[d]} credits
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
