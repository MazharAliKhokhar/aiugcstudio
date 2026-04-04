'use client'

import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/shared/Sidebar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface MobileSidebarProps {
  userProfile: {
    name: string;
    email: string;
    is_admin: boolean;
  }
}

export const MobileSidebar = ({ userProfile }: MobileSidebarProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!isMounted) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <div className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
          <Menu className="h-6 w-6" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-slate-900 border-none w-72">
        <Sidebar userProfile={userProfile} />
      </SheetContent>
    </Sheet>
  )
}
