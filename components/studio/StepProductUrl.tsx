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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="product-name" className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" /> Product Name <span className="text-slate-300 font-normal lowercase">(optional)</span>
          </Label>
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Input
              id="product-name"
              placeholder="e.g. Acme SuperBlender"
              maxLength={500}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="relative bg-slate-50 border-slate-200 rounded-2xl h-14 pl-6 focus-visible:ring-primary/40 text-base font-semibold text-slate-900 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-url" className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" /> Product Website URL
          </Label>
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Input
              id="product-url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="relative bg-slate-50 border-slate-200 rounded-2xl h-14 pl-6 focus-visible:ring-primary/40 text-base font-semibold text-slate-900 shadow-sm"
            />
          </div>
          <p className="text-sm text-slate-400 font-semibold italic">This is the destination link for your viral video ad.</p>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full h-14 text-lg font-black uppercase tracking-tighter rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all text-white border-0" 
        disabled={!url.trim()}
      >
        Deep-Analyze URLs <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
      </Button>
    </div>
  )
}
