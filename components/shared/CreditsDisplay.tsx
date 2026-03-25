'use client'

import { Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CreditsDisplayProps {
  credits: number
}

export function CreditsDisplay({ credits }: CreditsDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Credits balance:</span>
      <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm flex items-center gap-1.5 shadow-sm border-primary/20">
        <Coins className="w-4 h-4 text-yellow-500" />
        {credits}
      </Badge>
    </div>
  )
}
