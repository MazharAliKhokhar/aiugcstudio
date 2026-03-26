import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#070708] border-t border-white/5 py-12 px-6 relative z-10 overflow-hidden">
      <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight uppercase italic text-white">ViralUGC</span>
          </Link>
          <p className="text-white/70 max-w-sm font-medium">
            The world's fastest way to generate highly converting UGC video ads leveraging bleeding-edge AI models. Used by the top 1% of brands.
          </p>
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-white/50 mb-6">Product</h4>
          <ul className="space-y-3 text-sm font-bold text-white/80">
            <li><Link href="/login" className="hover:text-primary transition-colors">Studio Dash</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Public Gallery</Link></li>
            <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing & Plans</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-white/50 mb-6">Support</h4>
          <ul className="space-y-3 text-sm font-bold text-white/80">
            <li><Link href="mailto:support@viralugc.com" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-white/5 pt-8 text-center text-xs font-black uppercase tracking-widest text-white/40">
        <p>© {new Date().getFullYear()} ViralUGC. Built for the Elite.</p>
      </div>
    </footer>
  )
}
