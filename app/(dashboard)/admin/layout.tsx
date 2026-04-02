import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) {
    // If not an admin, redirect to the user's dashboard (studio)
    redirect('/studio')
  }

  return <>{children}</>
}
