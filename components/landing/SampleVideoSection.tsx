'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'

export function SampleVideoSection() {
  const [videoStarted, setVideoStarted] = useState(false)

  return (
    <section className="py-32 px-4 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full opacity-30" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Live Sample: AI-Generated Beauty UGC
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-[1000] tracking-tighter uppercase italic leading-[0.85]">
            THE <span className="text-primary italic">$10M</span> <br className="hidden md:block"/> CREATIVE.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
            This ad didn't exist 60 seconds ago. Engineered for <span className="text-white font-bold">161% higher conversion</span> using the top 10,000 viral beauty hooks.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto group"
        >
          {/* Video Player UI */}
          <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl shadow-primary/20 bg-black">
            {videoStarted ? (
              <iframe 
                src="https://www.youtube.com/embed/f30qLMYyovg?si=cvI_ySvmwfTrhm6m&autoplay=1" 
                className="w-full h-full"
                title="Viral Beauty Ad Sample"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            ) : (
              <>
                <img 
                  src="/beauty-sample.png" 
                  alt="Viral Beauty Ad Sample" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    onClick={() => setVideoStarted(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl cursor-pointer group/play"
                  >
                    <Play className="w-10 h-10 ml-2 fill-current" />
                  </motion.div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Viral Score</p>
                      <p className="text-xl font-black italic text-white">9.8/10</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase italic text-white">Ready to Scale</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Hooks Tested", value: "1,200+", desc: "AI-optimized for the first 3 seconds" },
            { label: "Avg. Watch Time", value: "+450%", desc: "Compared to traditional static ads" },
            { label: "Cost Savings", value: "98%", desc: "Versus hiring a full production crew" }
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{stat.label}</p>
              <p className="text-4xl font-black italic mb-2">{stat.value}</p>
              <p className="text-slate-400 text-sm font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
