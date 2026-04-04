'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, Target, Users, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Choose your ad objective</Label>
        
        <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-1 gap-4">
          {GOALS.map((g) => (
            <div key={g.id} className="relative group/item">
              <RadioGroupItem value={g.id} id={`goal-${g.id}`} className="peer sr-only" />
              <Label
                htmlFor={`goal-${g.id}`}
                className="flex items-center gap-6 rounded-3xl border-4 border-slate-100 bg-white p-6 hover:bg-slate-50 hover:border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full translate-x-16 -translate-y-16 peer-data-[state=checked]:bg-primary/20 transition-colors" />
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 shrink-0">
                  <g.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-1 peer-data-[state=checked]:text-primary transition-colors">{g.label}</div>
                  <div className="text-sm md:text-base text-slate-500 font-bold leading-tight max-w-xl peer-data-[state=checked]:text-slate-700 transition-colors">{g.desc}</div>
                </div>
                <div className="ml-auto flex items-center justify-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                    goal === g.id ? "border-primary bg-primary" : "border-slate-200 bg-transparent"
                  )}>
                    {goal === g.id && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex gap-6 pt-10">
        <Button variant="outline" onClick={onBack} className="w-40 h-16 rounded-3xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase italic tracking-tighter transition-all">
          <ArrowLeft className="mr-3 w-5 h-5" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!goal}
          className="flex-1 h-16 text-xl font-black uppercase tracking-tighter rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all text-white border-0"
        >
          Confirm Strategy <ArrowRight className="ml-4 w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
