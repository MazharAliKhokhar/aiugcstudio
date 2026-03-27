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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-white/50 mb-2 block">Choose your ad objective</Label>
        
        <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-1 gap-4">
          {GOALS.map((g) => (
            <div key={g.id} className="relative group/item">
              <RadioGroupItem value={g.id} id={`goal-${g.id}`} className="peer sr-only" />
              <Label
                htmlFor={`goal-${g.id}`}
                className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/10 peer-data-[state=checked]:border-primary/50 peer-data-[state=checked]:bg-primary/[0.05] cursor-pointer transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-12 -translate-y-12 peer-data-[state=checked]:bg-primary/10 transition-colors" />
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/20 shrink-0">
                  <g.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-black uppercase italic tracking-tight text-white mb-0.5">{g.label}</div>
                  <div className="text-xs text-white/50 font-medium leading-relaxed">{g.desc}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="w-32 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 h-14 text-lg font-black uppercase tracking-tighter rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all" disabled={!goal}>
          Continue <ArrowRight className="ml-3 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
