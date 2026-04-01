'use client'

import { motion } from 'framer-motion'
import { Zap, Smartphone } from 'lucide-react'

export function AssetShowcase() {
  return (
    <section className="relative py-20 overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto relative px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, rotateY: -20, x: -50 }}
            whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative aspect-[9/16] max-w-[300px] mx-auto rounded-[32px] overflow-hidden border border-black/5 shadow-[0_0_80px_rgba(255,107,0,0.1)]">
               <img src="/mockup-1.png" className="w-full h-full object-cover" alt="Mockup 1" />
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
               <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/5 backdrop-blur-md rounded-xl p-3 border border-black/5">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Generating Ad...</span>
                     </div>
                     <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: "100%" }}
                           transition={{ duration: 3, repeat: Infinity }}
                           className="h-full bg-primary" 
                        />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">Broadcast Quality.</h2>
              <p className="text-lg md:text-xl text-foreground/70 font-medium">
                Our Wan 2.1 implementation produces video so real, experienced ad buyers can't distinguish it from human creators.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-lg shadow-black/5 backdrop-blur-md">
                  <Zap className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-1 text-foreground">Instant</h4>
                  <p className="text-xs text-foreground/60">From URL to MP4 in 60s.</p>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-lg shadow-black/5 backdrop-blur-md">
                  <Smartphone className="w-8 h-8 text-blue-500 mb-4" />
                  <h4 className="font-bold mb-1 text-foreground">TikTok native</h4>
                  <p className="text-xs text-foreground/60">9:16 aspect ratio by default.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
