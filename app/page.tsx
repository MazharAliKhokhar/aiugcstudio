'use client'

import { useScroll, useTransform } from 'framer-motion'
import { Footer } from '@/components/shared/Footer'
import { useEffect } from 'react'
import { Hero } from '@/components/landing/Hero'
import { MascotSection } from '@/components/landing/MascotSection'
import { SampleVideoSection } from '@/components/landing/SampleVideoSection'
import { AssetShowcase } from '@/components/landing/AssetShowcase'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { CTASection } from '@/components/landing/CTASection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    // Force scroll to top on refresh
    window.scrollTo(0, 0)
    
    // Initialize Lemon Squeezy
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/30 font-sans">
      {/* GLOWING AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      <header className="px-6 h-20 flex items-center justify-between border-b border-black/5 bg-background/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase italic text-foreground">ViralUGC</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">Log In</Link>
          <Link href="/signup">
            <Button size="lg" className="rounded-xl px-7 bg-primary text-white hover:bg-primary/90 font-bold border-none shadow-lg shadow-primary/20">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        <Hero opacity={opacity} scale={scale} />
        <MascotSection />
        <SampleVideoSection />
        <AssetShowcase />
        <ComparisonSection />
        <FeaturesGrid />
        <HowItWorks />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
