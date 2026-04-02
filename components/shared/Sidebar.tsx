'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Video, Settings, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/(auth)/actions'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userProfile: {
    name: string;
    email: string;
    is_admin: boolean;
  }
}

export const Sidebar = ({ userProfile }: SidebarProps) => {
  const pathname = usePathname()
  const isAdmin = userProfile.is_admin

  const routes = [
    {
      label: 'Studio',
      icon: Video,
      href: '/studio',
      color: 'text-orange-500',
    },
    {
      label: 'Gallery',
      icon: LayoutDashboard,
      href: '/gallery',
      color: 'text-blue-500',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      color: 'text-gray-500',
    },
  ]

  if (isAdmin) {
    routes.push({
      label: 'Admin Panel',
      icon: ShieldCheck,
      href: '/admin',
      color: 'text-red-500',
    })
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/studio" className="flex items-center pl-3 mb-10 gap-2 group">
          <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition" />
          <h1 className="text-xl font-bold tracking-tight">ViralUGC</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="px-3 pb-4 space-y-4">
        <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
          <p className="text-xs text-zinc-500 truncate">{userProfile.email}</p>
        </div>
        <form action={signout}>
          <Button variant="ghost" type="submit" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10">
            Log out
          </Button>
        </form>
      </div>
    </div>
  )
}
