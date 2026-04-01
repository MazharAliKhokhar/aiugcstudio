'use client'

import { motion } from 'framer-motion'
import { Rocket, Heart, CheckCircle2 } from 'lucide-react'

export function FeaturesGrid() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-4 max-w-xl">
             <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900">Everything to <br/> Scale Vertically.</h2>
          </div>
          <div className="text-foreground/70 text-lg font-medium leading-tight max-w-md md:text-right">
             We built the pipeline we always wanted. No fluff, just high-converting asset generation.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-20">
          {/* Feature 1 */}
          <div className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-black/5 border border-black/5 backdrop-blur-3xl flex flex-col justify-between group hover:bg-white/[0.15] transition-all">
             <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                   <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight text-foreground">One-Click Multi-Variations</h3>
                <p className="text-foreground/80 text-xl font-medium">Don't just test one ad. Test ten. Select different hooks, avatars, and scripts for the same product link and generate the entire campaign in minutes.</p>
             </div>
             <div className="mt-12 h-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} className="h-full bg-primary" />
             </div>
          </div>

          {/* Feature 2 */}
          <div className="md:col-span-2 p-10 rounded-[40px] bg-black/5 border border-black/5 backdrop-blur-md hover:bg-white/[0.15] transition-all">
             <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                   <Heart className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-bold uppercase italic tracking-tight text-foreground">Emotional AI Scripting</h4>
                   <p className="text-foreground/70 text-sm">Our LLM is trained on the top 10,000 viral TikTok ads to write scripts that actually stop the scroll.</p>
                </div>
             </div>
          </div>

          {/* Feature 3 */}
          <div className="md:col-span-2 p-10 rounded-[40px] bg-black/5 border border-black/5 backdrop-blur-md hover:bg-white/[0.15] transition-all">
             <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                   <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-bold uppercase italic tracking-tight text-foreground">Refund Protection</h4>
                   <p className="text-foreground/70 text-sm">Atomic database logic ensures if a generation fails, your credits are returned instantly. Zero risk.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
