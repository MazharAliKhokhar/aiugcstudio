'use client'

import { motion } from 'framer-motion'

export function MascotSection() {
  return (
    <section className="py-24 px-4 bg-white relative z-20 border-b border-black/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-500/10"
          >
            Meet Doctor Panda · Our Secret Weapon
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-[1000] tracking-tighter leading-[0.9] uppercase italic text-slate-900"
          >
            "We don't just make ads,<br/> we make <span className="text-primary">viral</span> ads."
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-slate-600 max-w-xl font-medium"
          >
            Our proprietary creative engine is overseen by the most viral biological-AI hybrid in the world. 
            Every script, every hook, and every frame is engineered for conversion, not just aesthetics.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            scale: { duration: 0.8 },
            rotate: { duration: 0.8 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          viewport={{ once: true }}
          className="flex-1 relative group"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors duration-1000" />
          <img 
            src="/doctor-panda.png" 
            alt="Doctor Panda" 
            className="w-full max-w-[500px] mx-auto relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          />
        </motion.div>
      </div>
    </section>
  )
}
