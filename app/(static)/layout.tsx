import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/shared/Footer'

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            ViralUGC
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log In</Link>
          <Link href="/signup">
            <Button size="sm">Start Free</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
