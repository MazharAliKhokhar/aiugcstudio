'use client'

import { motion } from 'framer-motion'
import { Link as LinkIcon, Smartphone, Rocket } from 'lucide-react'

export function HowItWorks() {
  return (
    <section className="py-32 px-4 bg-white relative overflow-hidden border-y border-black/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 text-foreground">Three Steps To Total Scale.</h2>
          <p className="text-foreground/50 font-bold tracking-widest uppercase">The fastest pipeline in the industry. Period.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden md:block" />
          
          {[
            { step: "01", title: "Paste URL", desc: "Just drop your Shopify, Amazon, or Etsy product link. Our AI handles the rest.", icon: LinkIcon },
            { step: "02", title: "Select Avatar", desc: "Choose from 50+ hyper-realistic AI actors or let our engine pick the best fit.", icon: Smartphone },
            { step: "03", title: "Generate & Win", desc: "Get your broadcast-ready MP4 in 60s. Launch, test, and scale vertically.", icon: Rocket }
          ].map((item, i) => (
            <motion.div 
              key={item.step}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-white border border-black/5 flex items-center justify-center text-primary text-2xl font-black shadow-xl">
                {item.step}
              </div>
              <h4 className="text-2xl font-black uppercase italic tracking-tight text-foreground">{item.title}</h4>
              <p className="text-foreground/80 text-sm font-medium leading-relaxed px-6">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
