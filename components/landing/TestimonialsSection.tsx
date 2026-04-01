'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function TestimonialsSection() {
  return (
    <section className="py-32 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Wall of Success</div>
            <h2 className="text-5xl md:text-7xl font-[1000] tracking-tighter uppercase italic leading-[0.9] text-foreground">Loved by <br/> the top 1%.</h2>
            <p className="text-foreground/80 text-xl font-medium">Over 2,400 dropshippers and 80+ marketing agencies use ViralUGC to power their daily creative testing.</p>
          </div>

          <div className="grid gap-6">
            {[
              { name: "Alex M.", role: "7-Figure Ecom Founder", text: "We went from testing 2 hooks a week to 15 hooks a day. Our ROAS tripled in 14 days. This is the ultimate unfair advantage." },
              { name: "Sarah K.", role: "Agency Director", text: "My internal creative team used to be a bottleneck. Now, ViralUGC handles all our B-roll and Hook variations. It's a game changer." }
            ].map((t, i) => (
              <motion.div 
                key={t.name}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-[32px] bg-black/5 border border-black/5 backdrop-blur-md space-y-4"
              >
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-3 h-3 text-primary fill-primary" />)}
                </div>
                <p className="text-lg font-bold tracking-tight italic text-foreground">"{t.text}"</p>
                <div>
                  <p className="font-black uppercase italic tracking-tight text-foreground mb-0.5">{t.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary font-bold">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
