import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2 mb-4">
            ViralUGC
          </Link>
          <p className="text-muted-foreground max-w-sm">
            The world's fastest way to generate highly converting UGC video ads leveraging bleeding-edge AI models.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/login" className="hover:text-primary transition-colors">Studio</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Gallery</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Affiliates</Link></li>
            <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Legal & Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t pt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ViralUGC. All rights reserved.</p>
      </div>
    </footer>
  )
}
