import { Sidebar } from '@/components/shared/Sidebar'
import { CreditsDisplay } from '@/components/shared/CreditsDisplay'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get User Profile
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('credits, full_name, email, is_admin')
    .eq('id', user.id)
    .single()

  const credits = profile?.credits || 0
  const userProfile = {
    name: profile?.full_name || 'User',
    email: profile?.email || user.email || 'user@example.com',
    is_admin: profile?.is_admin || false
  }

  return (
    <div className="h-screen relative flex">
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <Sidebar userProfile={userProfile} />
      </div>
      <main className="md:pl-64 flex flex-col flex-1 h-full bg-slate-50 dark:bg-slate-950">
        <header className="h-16 flex items-center justify-end px-8 border-b bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
          <CreditsDisplay credits={credits} />
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
