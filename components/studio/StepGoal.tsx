'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, Target, Users, Megaphone } from 'lucide-react'

interface StepGoalProps {
  goal: string
  setGoal: (val: string) => void
  onNext: () => void
  onBack: () => void
}

const GOALS = [
  { id: 'sales', label: 'Direct Sales', icon: Target, desc: 'Focus on conversion and ROI' },
  { id: 'awareness', label: 'Brand Awareness', icon: Megaphone, desc: 'Maximize reach and impressions' },
  { id: 'retargeting', label: 'Retargeting', icon: Users, desc: 'Bring back warm leads' },
]

export function StepGoal({ goal, setGoal, onNext, onBack }: StepGoalProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold">What's the main goal of this ad?</Label>
        
        <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-1 gap-4">
          {GOALS.map((g) => (
            <div key={g.id} className="relative">
              <RadioGroupItem value={g.id} id={`goal-${g.id}`} className="peer sr-only" />
              <Label
                htmlFor={`goal-${g.id}`}
                className="flex items-start gap-4 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <g.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-lg">{g.label}</div>
                  <div className="text-sm text-muted-foreground">{g.desc}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="w-32 h-12">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 h-12 text-md" disabled={!goal}>
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
