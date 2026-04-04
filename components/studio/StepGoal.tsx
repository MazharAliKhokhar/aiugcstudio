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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Choose your ad objective</Label>
        
        <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-1 gap-6">
          {GOALS.map((g) => (
            <div key={g.id} className="relative group/item">
              <RadioGroupItem value={g.id} id={`goal-${g.id}`} className="peer sr-only" />
              <Label
                htmlFor={`goal-${g.id}`}
                className="flex items-center gap-8 rounded-[40px] border-4 border-slate-100 bg-white p-10 hover:bg-slate-50 hover:border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full translate-x-24 -translate-y-24 peer-data-[state=checked]:bg-primary/10 transition-colors" />
                <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 shrink-0">
                  <g.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter text-slate-900 mb-1.5 peer-data-[state=checked]:text-primary transition-colors">{g.label}</div>
                  <div className="text-sm md:text-base text-slate-500 font-bold leading-relaxed max-w-2xl peer-data-[state=checked]:text-slate-700 transition-colors">{g.desc}</div>
                </div>
                <div className="ml-auto opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity">
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                     <div className="w-3 h-3 rounded-full bg-white" />
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
