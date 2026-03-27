'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Link as LinkIcon, Box } from 'lucide-react'

interface StepProductUrlProps {
  url: string
  setUrl: (val: string) => void
  productName: string
  setProductName: (val: string) => void
  onNext: () => void
}

export function StepProductUrl({ url, setUrl, productName, setProductName, onNext }: StepProductUrlProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="product-name" className="text-sm font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" /> Product Name <span className="text-white/30 font-normal lowercase">(optional)</span>
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Input
              id="product-name"
              placeholder="e.g. Acme SuperBlender"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="relative bg-black/40 border-white/10 rounded-xl h-14 pl-4 focus-visible:ring-primary/50 text-base"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="product-url" className="text-sm font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" /> Product Website URL
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Input
              id="product-url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="relative bg-black/40 border-white/10 rounded-xl h-14 pl-4 focus-visible:ring-primary/50 text-base"
            />
          </div>
          <p className="text-xs text-white/40 font-medium">This is the destination link for your video ad.</p>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full h-14 text-lg font-black uppercase tracking-tighter rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all" 
        disabled={!url.trim()}
      >
        Continue <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
