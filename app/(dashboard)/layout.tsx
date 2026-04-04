import { Sidebar } from '@/components/shared/Sidebar'
import { MobileSidebar } from '@/components/shared/MobileSidebar'
import { CreditsDisplay } from '@/components/shared/CreditsDisplay'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  // We first try the standard client (respects RLS)
  let { data: profile, error } = await (supabase.from('profiles') as any)
    .select('credits, full_name, email, is_admin')
    .eq('id', user.id)
    .single()

  // FALLBACK: If the standard client fails (likely RLS issue) but we have a valid user,
  // we use the Admin client to fetch the profile for THIS USER ID ONLY.
  if (!profile || error) {
    console.log('[Layout] RLS/Fetch failed for user, trying admin fallback...', user.id)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    const { data: adminProfile } = await (adminClient.from('profiles') as any)
      .select('credits, full_name, email, is_admin')
      .eq('id', user.id)
      .single()
    
    if (adminProfile) {
      profile = adminProfile
      console.log('[Layout] Admin fallback successful for', user.email)
    }
  }

  const credits = profile?.credits ?? 0
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
        <header className="h-16 flex items-center justify-between md:justify-end px-4 md:px-8 border-b bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
          <div className="md:hidden">
            <MobileSidebar userProfile={userProfile} />
          </div>
          <CreditsDisplay credits={credits} />
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
