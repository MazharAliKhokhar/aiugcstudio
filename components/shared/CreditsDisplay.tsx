'use client'

import { Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CreditsDisplayProps {
  credits: number
}

export function CreditsDisplay({ credits }: CreditsDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/50 font-black uppercase tracking-widest">Units balance:</span>
      <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm flex items-center gap-1.5 shadow-sm border-primary/20 bg-primary/20 text-white rounded-full">
        <Coins className="w-4 h-4 text-white animate-pulse" />
        {credits}
      </Badge>
    </div>
  )
}
