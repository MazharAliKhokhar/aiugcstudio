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
      <Label className="text-base font-semibold">Select Video Duration</Label>
      <RadioGroup
        value={duration.toString()}
        onValueChange={(val) => setDuration(parseInt(val))}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[15, 30, 60].map((d) => (
          <div key={d}>
            <RadioGroupItem value={d.toString()} id={`duration-${d}`} className="peer sr-only" />
            <Label
              htmlFor={`duration-${d}`}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all gap-2"
            >
              <Clock className="w-6 h-6 mb-1 text-muted-foreground" />
              <span className="font-bold text-lg">{d}s</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                {DURATION_CREDIT_COSTS[d]} credits
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
