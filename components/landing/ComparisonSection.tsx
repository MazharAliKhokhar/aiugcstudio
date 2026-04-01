'use client'

import { XCircle, Check } from 'lucide-react'

export function ComparisonSection() {
  return (
    <section className="py-32 px-4 bg-primary/[0.02] relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Old Way */}
          <div className="space-y-8 p-8 border border-black/5 rounded-[40px] bg-black/5 backdrop-blur-sm grayscale opacity-70">
            <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-500/10">The Slow Way</div>
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-foreground/80">Manual UGC Production</h3>
            <ul className="space-y-4">
              {[
                "Waiting 14+ days for shipping",
                "Negotiating with unreliable influencers",
                "Paying $150-$500 per single video",
                "Bad lighting, retakes, and headaches"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-foreground/50 line-through decoration-red-500/30 font-medium">
                  <XCircle className="w-5 h-4 text-red-500/40 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* New Way */}
          <div className="space-y-8 p-10 border border-primary/20 bg-white rounded-[40px] relative overflow-hidden group shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 border border-black/5">The ViralUGC Way</div>
            <h3 className="text-4xl font-black uppercase italic tracking-tight text-foreground">AI Infrastructure</h3>
            <ul className="space-y-6">
              {[
                "Generate dozens of variations instantly",
                "Zero shipping, zero physical constraints",
                "Hyper-realistic AI actors (Wan 2.1)",
                "Scale to 7-figures with high-volume testing"
              ].map(item => (
                <li key={item} className="flex items-center gap-4 text-xl font-bold tracking-tight text-foreground/90">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                     <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
