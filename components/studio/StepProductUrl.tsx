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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            <Box className="w-4 h-4 text-primary" /> Product Name <span className="text-slate-300 font-normal lowercase">(optional)</span>
          </Label>
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[20px] blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Input
              id="product-name"
              placeholder="e.g. Acme SuperBlender"
              maxLength={500}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="relative bg-slate-50 border-slate-200 rounded-xl h-10 pl-4 focus-visible:ring-primary/40 text-sm font-semibold text-slate-900 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-url" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-primary" /> Product Website URL
          </Label>
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[20px] blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <Input
              id="product-url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="relative bg-slate-50 border-slate-200 rounded-xl h-10 pl-4 focus-visible:ring-primary/40 text-sm font-semibold text-slate-900 shadow-sm"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold italic">This is the destination link for your viral video ad.</p>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full h-11 text-base font-black uppercase tracking-tighter rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all text-white border-0" 
        disabled={!url.trim()}
      >
        Deep-Analyze URLs <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
