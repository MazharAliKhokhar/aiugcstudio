'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, XCircle, CheckCircle2, Play, Video as VideoIcon, CreditCard, LayoutDashboard, Check, HelpCircle, Smartphone, Rocket, Zap, Heart } from 'lucide-react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Footer } from '@/components/shared/Footer'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="min-h-screen bg-[#070708] text-foreground flex flex-col overflow-x-hidden selection:bg-primary/30">
      {/* GLOWING AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full opacity-30" />
      </div>

      <header className="px-6 h-20 flex items-center justify-between border-b border-white/5 bg-[#070708]/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase italic">ViralUGC</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Log In</Link>
          <Link href="/signup">
            <Button size="lg" className="rounded-xl px-7 bg-white text-black hover:bg-white/90 font-bold border-none">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* HERO */}
        <section className="relative pt-20 pb-32 md:pt-40 md:pb-48 px-4 overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-[-1]">
             <img 
               src="/hero-bg.png" 
               className="w-full h-full object-cover opacity-40 scale-105" 
               alt="Background"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#070708] via-transparent to-[#070708]" />
          </div>
          
          <motion.div 
            style={{ opacity, scale }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-xs md:text-sm font-bold text-primary shadow-2xl mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-3 animate-pulse" />
              THE FUTURE OF UGC IS HERE · POWERED BY KLING 2.1
            </div>

            <h1 className="text-5xl md:text-8xl font-[1000] tracking-tighter leading-[0.9] uppercase">
              GENERATE <span className="text-primary italic">VIRAL</span> <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">AD VARIATIONS</span> <br className="hidden md:block"/>
              IN SECONDS
            </h1>

            <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed font-medium">
              Scale your dropshipping store or agency with hyper-realistic AI actors. 
              No shipping, no actors, no waiting. Just paste your URL and win.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-16 rounded-2xl px-12 text-xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary to-orange-600 hover:scale-105 transition-all duration-300 group">
                  Get Started Free <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#070708] bg-white/10 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-[#070708] bg-primary flex items-center justify-center text-[10px] font-black italic">
                  +2.4k
                </div>
              </div>
              <p className="text-sm font-bold text-white/40 tracking-widest uppercase md:ml-4">Used by top 1% brands</p>
            </div>
          </motion.div>

          {/* TRUSTED BY LOGOS */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-8">Powering the fastest growing stores on</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale contrast-125">
              <span className="text-2xl font-black italic">Shopify</span>
              <span className="text-2xl font-black italic">Amazon</span>
              <span className="text-2xl font-black italic">TikTok</span>
              <span className="text-2xl font-black italic">Etsy</span>
              <span className="text-2xl font-black italic">Woo</span>
            </div>
          </motion.div>

          {/* SHOWCASE ASSETS */}
          <div className="mt-32 max-w-6xl mx-auto relative px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, rotateY: -20, x: -50 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true }}
                className="relative group cursor-pointer"
              >
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative aspect-[9/16] max-w-[300px] mx-auto rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,107,0,0.1)]">
                   <img src="/mockup-1.png" className="w-full h-full object-cover" alt="Mockup 1" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Generating Ad...</span>
                         </div>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
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
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase italic tracking-tighter">Broadcast Quality.</h2>
                  <p className="text-lg md:text-xl text-white/50 font-medium">
                    Our Kling 2.1 implementation produces video so real, experienced ad buyers can't distinguish it from human creators.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                      <Zap className="w-8 h-8 text-primary mb-4" />
                      <h4 className="font-bold mb-1">Instant</h4>
                      <p className="text-xs text-white/40">From URL to MP4 in 60s.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                      <Smartphone className="w-8 h-8 text-blue-500 mb-4" />
                      <h4 className="font-bold mb-1">TikTok native</h4>
                      <p className="text-xs text-white/40">9:16 aspect ratio by default.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="py-32 px-4 bg-muted/5 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Old Way */}
              <div className="space-y-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500 p-8 border border-white/5 rounded-[40px]">
                <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-black uppercase italic italic tracking-widest">The Slow Way</div>
                <h3 className="text-3xl font-black uppercase italic italic tracking-tight">Manual UGC</h3>
                <ul className="space-y-4">
                  {[
                    "Waiting 14+ days for shipping",
                    "Negotiating with unreliable influencers",
                    "Paying $150-$500 per single video",
                    "Bad lighting, retakes, and headaches"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-white/50 line-through decoration-red-500/50">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* New Way */}
              <div className="space-y-8 p-10 border-2 border-primary bg-primary/5 rounded-[40px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary text-white text-xs font-black uppercase italic italic tracking-widest">The ViralUGC Way</div>
                <h3 className="text-4xl font-black uppercase italic italic tracking-tight italic text-primary">AI Infrastructure</h3>
                <ul className="space-y-6">
                  {[
                    "Generate dozens of variations instantly",
                    "Zero shipping, zero physical constraints",
                    "Hyper-realistic AI actors (Kling 2.1)",
                    "Scale to 7-figures with high-volume testing"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-4 text-xl font-bold tracking-tight">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                         <Check className="w-4 h-4 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-32 px-4">
           <div className="max-w-6xl mx-auto space-y-24">
              <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                 <div className="space-y-4 max-w-xl">
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase italic tracking-tighter">Everything to <br/> Scale Vertically.</h2>
                 </div>
                 <div className="text-white/40 text-lg font-medium leading-tight max-w-md md:text-right">
                    We built the pipeline we always wanted. No fluff, just high-converting asset generation.
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-20">
                 {/* Feature 1 */}
                 <div className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-white/5 border border-white/5 backdrop-blur-3xl flex flex-col justify-between group hover:bg-white/[0.07] transition-all">
                    <div className="space-y-6">
                       <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                          <Rocket className="w-8 h-8 text-primary" />
                       </div>
                       <h3 className="text-3xl font-black uppercase italic italic tracking-tight">One-Click Multi-Variations</h3>
                       <p className="text-white/50 text-xl font-medium">Don't just test one ad. Test ten. Select different hooks, avatars, and scripts for the same product link and generate the entire campaign in minutes.</p>
                    </div>
                    <div className="mt-12 h-1 bg-white/10 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} className="h-full bg-primary" />
                    </div>
                 </div>

                 {/* Feature 2 */}
                 <div className="md:col-span-2 p-10 rounded-[40px] bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                    <div className="flex gap-6 items-start">
                       <div className="shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-blue-500" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold uppercase italic italic tracking-tight">Emotional AI Scripting</h4>
                          <p className="text-white/40 text-sm">Our LLM is trained on the top 10,000 viral TikTok ads to write scripts that actually stop the scroll.</p>
                       </div>
                    </div>
                 </div>

                 {/* Feature 3 */}
                 <div className="md:col-span-2 p-10 rounded-[40px] bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                    <div className="flex gap-6 items-start">
                       <div className="shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold uppercase italic italic tracking-tight">Refund Protection</h4>
                          <p className="text-white/40 text-sm">Atomic database logic ensures if a generation fails, your credits are returned instantly. Zero risk.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 px-4 bg-[#0d0d0f] relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />
           <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                 <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">Three Steps To Total Scale.</h2>
                 <p className="text-white/40 font-bold tracking-widest uppercase">The fastest pipeline in the industry. Period.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                 <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden md:block" />
                 
                 {[
                    { step: "01", title: "Paste URL", desc: "Just drop your Shopify, Amazon, or Etsy product link. Our AI handles the rest.", icon: Link },
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
                       <div className="w-20 h-20 rounded-full bg-[#070708] border border-white/10 flex items-center justify-center text-primary text-2xl font-black shadow-2xl">
                          {item.step}
                       </div>
                       <h4 className="text-2xl font-black uppercase italic tracking-tight">{item.title}</h4>
                       <p className="text-white/50 text-sm font-medium leading-relaxed px-6">{item.desc}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-32 px-4 overflow-hidden">
           <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                 <div className="space-y-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Wall of Success</div>
                    <h2 className="text-5xl md:text-7xl font-[1000] tracking-tighter uppercase italic leading-[0.9]">Loved by <br/> the top 1%.</h2>
                    <p className="text-white/40 text-xl font-medium">Over 2,400 dropshippers and 80+ marketing agencies use ViralUGC to power their daily creative testing.</p>
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
                         className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-md space-y-4"
                       >
                          <div className="flex gap-1">
                             {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-3 h-3 text-primary fill-primary" />)}
                          </div>
                          <p className="text-lg font-bold tracking-tight italic text-white/80">"{t.text}"</p>
                          <div>
                             <p className="font-black uppercase italic tracking-tight text-white mb-0.5">{t.name}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t.role}</p>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-32 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-6xl md:text-8xl font-[1000] tracking-tighter leading-none mb-6">PICK YOUR <br/><span className="text-primary italic">WEAPON.</span></h2>
              <p className="text-xl text-white/40 font-bold tracking-widest uppercase">Prices reflect the early access discount. Scale now.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plans */}
              {[
                { 
                  name: "Starter", 
                  price: "$69", 
                  credits: "4", 
                  popular: false, 
                  color: "white", 
                  link: process.env.NEXT_PUBLIC_LS_STARTER_URL,
                  features: ["4 AI Video Ads / Mo", "Standard Rendering", "Commercial License", "Public Library Access"]
                },
                { 
                  name: "Growth Pro", 
                  price: "$149", 
                  credits: "10", 
                  popular: true, 
                  color: "primary", 
                  link: process.env.NEXT_PUBLIC_LS_GROWTH_URL,
                  features: ["10 AI Video Ads / Mo", "Priority Rendering", "Commercial License", "Private Gallery", "Priority Hooks AI"]
                },
                { 
                  name: "Ad Scale", 
                  price: "$399", 
                  credits: "30", 
                  popular: false, 
                  color: "white", 
                  link: process.env.NEXT_PUBLIC_LS_SCALE_URL,
                  features: ["30 AI Video Ads / Mo", "Express Rendering", "Commercial License", "Dedicated Support", "Full API Access"]
                }
              ].map((plan, i) => (
                <motion.div 
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-1 rounded-[40px] relative transition-transform hover:-translate-y-2",
                    plan.popular ? "bg-gradient-to-br from-primary to-orange-600 scale-105 z-10" : "bg-white/10"
                  )}
                >
                  <div className="h-full w-full bg-[#0d0d0f] rounded-[39px] p-10 flex flex-col">
                    {plan.popular && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black italic flex items-center gap-1.5 px-4 py-1.5 rounded-full shadow-xl">
                          <CheckCircle2 className="w-3 h-3 text-primary" /> MOST CHOSEN
                       </div>
                    )}
                    <div className="mb-10 space-y-2">
                       <h3 className="text-2xl font-black uppercase italic italic tracking-tight">{plan.name}</h3>
                       <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black">{plan.price}</span>
                          <span className="text-white/30 font-bold uppercase tracking-widest text-xs">/ month</span>
                       </div>
                    </div>

                    <ul className="space-y-5 mb-12 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 font-bold text-sm tracking-tight text-white/70">
                          <Check className={cn("w-5 h-5", plan.popular ? "text-primary" : "text-white/40")} /> {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.link || "/signup"}>
                      <Button className={cn(
                        "w-full h-14 rounded-2xl text-lg font-black uppercase tracking-tighter transition-all",
                        plan.popular ? "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
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

        {/* CTA */}
        <section className="py-40 px-4">
           <div className="max-w-4xl mx-auto p-16 md:p-24 rounded-[60px] bg-white text-black text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary opacity-20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500 opacity-20 blur-[100px] rounded-full" />
              
              <h2 className="text-5xl md:text-8xl font-[1000] tracking-tighter leading-[0.85] uppercase italic italic mb-10 relative z-10">
                 STOP LOSING <br className="hidden md:block"/> ON <span className="text-primary underline">UGC.</span>
              </h2>
              <p className="text-xl md:text-2xl font-bold tracking-tight text-black/60 mb-12 relative z-10 max-w-xl mx-auto leading-tight">
                 You are one high-converting hook away from scaling to 7-figures. Generate it today.
              </p>
              <Link href="/signup" className="relative z-10 inline-block">
                <Button size="lg" className="h-20 rounded-[32px] px-16 text-2xl font-black uppercase tracking-tighter bg-black text-white hover:bg-black/90 hover:scale-105 transition-all">
                   Join ViralUGC <ArrowRight className="w-8 h-8 ml-4" />
                </Button>
              </Link>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

