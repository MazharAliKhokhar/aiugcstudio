'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, ArrowRight, CheckCircle2, User, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ACTORS, Actor } from '@/lib/actors'
import { cn } from '@/lib/utils'

interface StepAvatarProps {
  selectedActor: string
  setSelectedActor: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepAvatar({ selectedActor, setSelectedActor, onNext, onBack }: StepAvatarProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'male'|'female'>('all')

  const filteredActors = ACTORS.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || a.gender === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-1">3. Select Human Hook</h3>
            <p className="text-white/40 text-sm font-medium">Choose a photorealistic AI actor to front your ad.</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", 
                filter === 'all' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
            >All</button>
            <button 
              onClick={() => setFilter('male')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", 
                filter === 'male' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
            >Male</button>
            <button 
              onClick={() => setFilter('female')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", 
                filter === 'female' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
            >Female</button>
          </div>
        </div>

        <div className="relative group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/search:text-primary transition-colors" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actors (e.g. James, Sarah)..." 
            className="pl-12 h-14 rounded-2xl bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-all font-medium text-white"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredActors.map((actor) => (
            <div 
              key={actor.id}
              onClick={() => setSelectedActor(actor.id)}
              className={cn(
                "group relative aspect-square rounded-[24px] overflow-hidden border-2 cursor-pointer transition-all duration-300",
                selectedActor === actor.id 
                  ? "border-primary scale-95 shadow-[0_0_20px_rgba(255,107,0,0.2)]" 
                  : "border-transparent hover:border-white/20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
              )}
            >
              <img 
                src={actor.thumbnail} 
                alt={actor.name} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{actor.name}</span>
                {selectedActor === actor.id && <CheckCircle2 className="w-4 h-4 text-primary fill-black p-[1px] rounded-full" />}
              </div>
            </div>
          ))}
          {filteredActors.length === 0 && (
            <div className="col-span-full py-12 text-center text-white/30 font-medium italic">No actors match your search.</div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-6 mt-auto">
        <Button variant="outline" onClick={onBack} className="w-32 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedActor}
          className="flex-1 h-14 text-lg font-black uppercase tracking-tighter rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-0"
        >
          Secure Actor <ArrowRight className="ml-3 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
