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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name" className="text-base font-semibold">Product Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <div className="relative">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="product-name"
              placeholder="e.g. Acme SuperBlender"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-url" className="text-base font-semibold">Product URL Target</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="product-url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
          <p className="text-sm text-muted-foreground">This is the link you want people to click.</p>
        </div>
      </div>

      <Button onClick={onNext} className="w-full h-12 text-md mt-4" disabled={!url.trim()}>
        Next Step <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  )
}
