'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-40 px-4">
       <div className="max-w-5xl mx-auto p-16 md:p-24 rounded-[60px] bg-primary text-white text-center relative overflow-hidden shadow-2xl shadow-primary/20 group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 opacity-50" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 opacity-20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/30 opacity-20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
          
          <h2 className="text-5xl md:text-8xl font-[1000] tracking-tighter leading-[0.85] uppercase italic mb-10 relative z-10 drop-shadow-2xl">
             STOP LOSING <br className="hidden md:block"/> ON <span className="text-white/40 underline decoration-white/30">UGC.</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold tracking-tight text-white/80 mb-12 relative z-10 max-w-xl mx-auto leading-tight">
             You are one high-converting hook away from scaling to 7-figures. Generate it today.
          </p>
          <Link href="/signup" className="relative z-10 inline-block">
            <Button size="lg" className="h-20 rounded-[32px] px-16 text-2xl font-black uppercase tracking-tighter bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all shadow-2xl shadow-black/10">
               Join ViralUGC <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </Link>
       </div>
    </section>
  )
}
