'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, XCircle, CheckCircle2, Play, Video as VideoIcon, CreditCard, LayoutDashboard, Check, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Footer } from '@/components/shared/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">ViralUGC</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log In</Link>
          <Link href="/signup">
            <Button size="sm">Start Free</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] md:w-[800px] md:h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto space-y-6 relative z-10"
          >
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4 mr-2" /> Start Earning With High-Converting Ads
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter leading-tight uppercase">
              Start Generating Viral <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">TikTok & Reels Ads</span> In Minutes
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
              Get complete AI infrastructure to build high-converting UGC video ads. No face to show, no products to ship, and no actors to hire. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-orange-600 hover:scale-105 transition-transform">
                  Join The Platform <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground sm:hidden mt-2">Zero upfront investment required.</p>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No Editing Needed</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Start in 60s</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Proven ROI</span>
            </div>
          </motion.div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* OLD WAY VS NEW WAY */}
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 uppercase">The Old Ways Don't Work Anymore</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Traditional UGC advertising is too expensive, too slow, and too risky.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 md:p-10"
            >
              <div className="mb-8">
                <span className="bg-red-500/20 text-red-500 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">The Old Way</span>
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-lg">Waiting weeks to find and negotiate with reliable UGC creators.</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-lg">Spending $150+ for a single 15-second ad variation.</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-lg">Shipping physical products across the country and paying for returns.</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-lg">Struggling with bad lighting, poor scripts, and unenthusiastic delivery.</span>
                </li>
              </ul>
            </motion.div>

            {/* New Way */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full translate-x-8 -translate-y-8" />
              <div className="mb-8 relative z-10">
                <span className="bg-primary/20 text-primary font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">The ViralUGC Way</span>
              </div>
              <ul className="space-y-6 relative z-10">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg"><strong>Zero logistics:</strong> Generate a broadcast-ready video instantly using just a URL.</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg"><strong>Pennies on the dollar:</strong> Pay roughly $1 per high-fidelity ad variation.</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg"><strong>A/B Test Everything:</strong> Iterate on scripts, hooks, and avatars in real-time.</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg"><strong>Hyper-realistic AI:</strong> Nobody will know your actor is generated by the Kling 2.1 model.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* WHAT YOU GET / FEATURES */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 uppercase">What's Inside The Platform</h2>
              <p className="text-xl text-muted-foreground">Everything you need to launch converting campaigns immediately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border rounded-3xl p-8 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <VideoIcon className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-3">Cinematic AI Rendering Engine</h3>
                <p className="text-muted-foreground text-lg leading-relaxed md:w-4/5">Powered by the cutting-edge Kling 2.1 video model. You get photorealistic human avatars, perfect lip synchronization, hyper-accurate product textures, and stunningly smooth 60fps movement.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-1 bg-gradient-to-br from-card to-card/50 border rounded-3xl p-8"
              >
                <LayoutDashboard className="w-10 h-10 text-orange-500 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Copywriter AI</h3>
                <p className="text-muted-foreground text-lg">Don't know what to prompt? Paste a product link and our pipeline automatically writes a high-converting hook and script.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-1 bg-gradient-to-br from-card to-card/50 border rounded-3xl p-8"
              >
                <Play className="w-10 h-10 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Adaptable Lengths</h3>
                <p className="text-muted-foreground text-lg">Generate 15s clips for rapid TikTok hooks, or full 60s explainer ads for Facebook and YouTube.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border rounded-3xl p-8 relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000')] opacity-5 grayscale mix-blend-overlay scale-105" />
                <CreditCard className="w-10 h-10 text-green-500 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Zero Subscription Lock-In</h3>
                <p className="text-muted-foreground text-lg leading-relaxed md:w-4/5">Unlike traditional agencies holding you hostage to a retainer, we operate on simple Video Credits. Buy credits, generate videos, and own the final MP4 royalty-free forever.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WHO IS THIS FOR / TARGET AUDIENCE */}
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 uppercase">Who Is This Platform For?</h2>
            <p className="text-xl text-muted-foreground">This system isn’t just theory; it’s a proven weapon for generating sales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Content Creators & Students</h3>
              <p className="text-muted-foreground">Start building a TikTok Theme Page empire or a faceless brand without showing your face or buying expensive gear.</p>
            </div>

            <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Ecom & Dropshippers</h3>
              <p className="text-muted-foreground">Scale your stores aggressively. A/B test 10 different video hooks in one hour instead of waiting two weeks for a creator to mail your product back.</p>
            </div>

            <div className="bg-card border rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Marketing Agencies</h3>
              <p className="text-muted-foreground">Offer your clients limitless creative iterations. Instantly generate B-roll, hooks, and localized video ads without hiring a production crew.</p>
            </div>
          </div>
        </section>

        {/* PRICING (Existing Code) */}
        <section id="pricing" className="py-24 px-4 bg-muted/30 relative">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 uppercase">And Now For The Pricing</h2>
            <p className="text-xl text-muted-foreground">Get started today for a fraction of the cost of one human UGC video.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border rounded-3xl p-8 flex flex-col hover:border-primary/50 transition-colors"
            >
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6 h-12">Side-hustlers & New Dropshippers</p>
              <div className="mb-6">
                <span className="text-5xl font-bold tracking-tight">$69</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span><strong>4 AI Video Ads</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Watermark-free</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Commercial License</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full" variant="outline">Start Generating</Button>
              </Link>
            </motion.div>

            {/* Growth Pro Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-card to-card/50 border border-primary/50 relative rounded-3xl p-8 flex flex-col shadow-2xl shadow-primary/10 overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-orange-500" />
              <div className="absolute top-6 right-6 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Growth Pro</h3>
              <p className="text-muted-foreground mb-6 h-12">Established E-com Brands</p>
              <div className="mb-6">
                <span className="text-5xl font-bold tracking-tight">$149</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span><strong>10 AI Video Ads</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Watermark-free</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Commercial License</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Priority Queue</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full shadow-lg shadow-primary/20">Start Growing</Button>
              </Link>
            </motion.div>

            {/* Ad Scale Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-3xl p-8 flex flex-col hover:border-primary/50 transition-colors"
            >
              <h3 className="text-2xl font-bold mb-2">Ad Scale</h3>
              <p className="text-muted-foreground mb-6 h-12">Marketing Agencies & Power Users</p>
              <div className="mb-6">
                <span className="text-5xl font-bold tracking-tight">$399</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span><strong>30 AI Video Ads</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Watermark-free</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Commercial License</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                  <span>Priority Queue</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full" variant="outline">Scale Now</Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FAQ & GUARANTEE */}
        <section className="py-24 px-4 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-card to-card/50 border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">100% Risk-Free Guarantee</h2>
            <p className="text-xl text-muted-foreground mb-8 relative z-10 max-w-2xl mx-auto">
              We know AI can sometimes be unpredictable. If our servers fail to generate your video, or if the system encounters a fatal error, your Video Credits will be automatically and fully refunded to your balance. No questions asked.
            </p>
            <Link href="/signup" className="relative z-10">
              <Button size="lg" className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg">
                Create Your Account Now
              </Button>
            </Link>
          </div>

          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-muted/30 border rounded-2xl p-6">
                <h3 className="text-lg font-bold flex items-center gap-3 mb-2"><HelpCircle className="w-5 h-5 text-primary" /> Do you own the videos generated?</h3>
                <p className="text-muted-foreground">No, you do! All plans come with a full commercial license. You can use the generated videos for Facebook Ads, YouTube Ads, TikToks, or organic posts without any royalties owed to us.</p>
              </div>
              <div className="bg-muted/30 border rounded-2xl p-6">
                <h3 className="text-lg font-bold flex items-center gap-3 mb-2"><HelpCircle className="w-5 h-5 text-primary" /> How long does a generation take?</h3>
                <p className="text-muted-foreground">Depending on the duration (15s to 60s) and server load, your final broadcast-ready MP4 will be delivered to your Studio dashboard usually within 60 to 180 seconds.</p>
              </div>
              <div className="bg-muted/30 border rounded-2xl p-6">
                <h3 className="text-lg font-bold flex items-center gap-3 mb-2"><HelpCircle className="w-5 h-5 text-primary" /> Do I need specific video skills?</h3>
                <p className="text-muted-foreground">Absolutely zero. Our multi-step Prompt Builder holds your hand the entire way. Just paste your website product URL, select your target audience, and click generate. It's that simple.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
