'use client'

import { motion } from 'framer-motion'
import { Check, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const plans = [
    { 
      name: "Starter", 
      price: "$99", 
      units: "20", 
      popular: false, 
      color: "white", 
      link: process.env.NEXT_PUBLIC_LS_STARTER_URL,
      features: ["20 Video Units / Mo", "Viral hook AI", "Commercial License", "Standard Rendering", "1 Unit = 15s Ad"]
    },
    { 
      name: "Pro", 
      price: "$299", 
      units: "100", 
      popular: true, 
      color: "primary", 
      link: process.env.NEXT_PUBLIC_LS_GROWTH_URL,
      features: ["100 Video Units / Mo", "Priority Rendering", "Private Gallery", "Priority AI Hooks", "Commercial License", "1 Unit = 15s Ad"]
    },
    { 
      name: "Scale", 
      price: "$799", 
      units: "300", 
      popular: false, 
      color: "white", 
      link: process.env.NEXT_PUBLIC_LS_SCALE_URL,
      features: ["300 Video Units / Mo", "Express Rendering", "Dedicated Support", "Full API Access", "Commercial License", "1 Unit = 15s Ad"]
    }
  ]

  return (
    <section id="pricing" className="py-32 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-6xl md:text-8xl font-[1000] tracking-tighter leading-none mb-6 text-foreground">PICK YOUR <br/><span className="text-primary italic">WEAPON.</span></h2>
          <p className="text-sm font-black text-foreground/30 tracking-[0.3em] uppercase">Limited slots available for early access scale. Secure yours.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-[1px] rounded-[40px] relative transition-all duration-500 hover:-translate-y-2",
                plan.popular ? "bg-gradient-to-br from-primary via-blue-500 to-primary/50 scale-105 z-10 shadow-2xl shadow-primary/10" : "bg-black/5 hover:bg-black/10"
              )}
            >
              <div className="h-full w-full bg-card rounded-[39px] p-10 flex flex-col relative group/card shadow-xl shadow-black/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 rounded-[39px] overflow-hidden" />
                {plan.popular && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black italic flex items-center gap-1.5 px-4 py-1.5 rounded-full shadow-2xl border border-white/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" /> MOST POPULAR
                   </div>
                )}
                <div className="mb-10 space-y-2">
                   <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground/80">{plan.name}</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-foreground">{plan.price}</span>
                      <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">/ month</span>
                   </div>
                </div>

                <ul className="space-y-5 mb-12 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 font-bold text-sm tracking-tight text-foreground/70">
                       <Check className={cn("w-4 h-4", plan.popular ? "text-primary" : "text-foreground/30")} /> {f}
                     </li>
                  ))}
                </ul>

                <Link 
                  href={plan.link || "/signup"}
                  className={cn(plan.link && "lemonsqueezy-button")}
                >
                  <Button className={cn(
                    "w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tighter transition-all duration-300 shadow-lg",
                    plan.popular ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20 border-0" : "bg-black/5 hover:bg-black/10 text-foreground border border-black/5"
                  )}>
                    Choose Plan
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
