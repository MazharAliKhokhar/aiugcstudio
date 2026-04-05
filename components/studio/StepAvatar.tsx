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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 mb-0.5">3. Select Human Hook</h3>
            <p className="text-slate-500 text-sm font-medium">Choose a photorealistic AI actor to front your ad.</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", 
                filter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600")}
            >All</button>
            <button 
              onClick={() => setFilter('male')}
              className={cn("px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", 
                filter === 'male' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600")}
            >Male</button>
            <button 
              onClick={() => setFilter('female')}
              className={cn("px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", 
                filter === 'female' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600")}
            >Female</button>
          </div>
        </div>

        <div className="relative group/search">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/search:text-primary transition-colors" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actors..." 
            className="pl-12 h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/40 transition-all font-semibold text-slate-900 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 pr-1">
          {filteredActors.map((actor) => (
            <div 
              key={actor.id}
              onClick={() => setSelectedActor(actor.id)}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300",
                selectedActor === actor.id 
                  ? "border-primary scale-95 shadow-lg shadow-primary/20" 
                  : "border-transparent hover:border-slate-200"
              )}
            >
              <img 
                src={actor.thumbnail} 
                alt={actor.name} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${actor.name}&background=6366f1&color=fff&bold=true`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic drop-shadow-md">{actor.name}</span>
                {selectedActor === actor.id && <CheckCircle2 className="w-5 h-5 text-primary fill-white p-[1px] rounded-full shadow-lg" />}
              </div>
            </div>
          ))}
          {filteredActors.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-300 font-medium italic text-lg">No actors match your search.</div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 md:-mx-10 -mb-5 md:-mb-10 mt-3 p-3 md:p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3 z-20">
        <Button variant="outline" onClick={onBack} className="w-28 h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase italic tracking-tighter transition-all">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedActor}
          className="flex-1 h-11 text-base font-black uppercase tracking-tighter rounded-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all text-white border-0"
        >
          Secure Actor <ArrowRight className="ml-4 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
