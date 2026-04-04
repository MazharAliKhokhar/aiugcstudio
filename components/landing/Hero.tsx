'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, MotionValue, useTransform } from 'framer-motion'

interface HeroProps {
  opacity: MotionValue<number>
  scale: MotionValue<number>
}

export function Hero({ opacity, scale }: HeroProps) {
  return (
    <section className="relative pt-20 pb-16 md:pt-40 md:pb-20 px-4 overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-[0]">
         <img 
           src="/hero-bg.png" 
           className="w-full h-full object-cover opacity-10 scale-105 pointer-events-none" 
           alt="Background"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-background" />
      </div>
      
      <motion.div 
        style={{ opacity, scale }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto text-center space-y-8 relative z-10"
      >
        <div className="inline-flex items-center rounded-full border border-black/5 bg-white backdrop-blur-md px-4 py-2 text-xs md:text-sm font-bold text-foreground shadow-sm mb-4">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-3 animate-pulse" />
          THE FUTURE OF UGC IS HERE · POWERED BY WAN 2.1 (OPEN SOURCE)
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-8xl font-[1000] tracking-tighter leading-[0.9] uppercase text-foreground">
          GENERATE <span className="text-primary italic">VIRAL</span> <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic">AD VARIATIONS</span> <br className="hidden md:block"/>
          IN SECONDS
        </h1>

        <p className="text-base sm:text-lg md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-medium px-4">
          Scale your dropshipping store or agency with hyper-realistic AI actors. 
          No shipping, no actors, no waiting. Just paste your URL and win.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 md:pt-10">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 md:h-16 rounded-2xl px-12 text-lg md:text-xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all duration-300 group text-white">
              Get Started Free <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-black/5 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-black italic text-white">
              +2.4k
            </div>
          </div>
          <p className="text-sm font-bold text-foreground/70 tracking-widest uppercase md:ml-4">Used by top 1% brands</p>
        </div>
      </motion.div>

      {/* TRUSTED BY LOGOS */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-20 max-w-5xl mx-auto relative z-10"
      >
        <p className="text-xs font-black tracking-[0.3em] text-foreground/80 uppercase mb-8 text-center">Powering the fastest growing stores on</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 contrast-75 brightness-0">
          <span className="text-2xl font-black italic text-foreground">Shopify</span>
          <span className="text-2xl font-black italic text-foreground">Amazon</span>
          <span className="text-2xl font-black italic text-foreground">TikTok</span>
          <span className="text-2xl font-black italic text-foreground">Etsy</span>
          <span className="text-2xl font-black italic text-foreground">Woo</span>
        </div>
      </motion.div>
    </section>
  )
}
