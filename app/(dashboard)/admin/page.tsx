import { getAdminStats } from './actions'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  let data: any = null
  let error: string | null = null

  try {
    data = await getAdminStats(query)
  } catch (err: any) {
    error = err.message || 'Failed to load admin data'
  }

  return <AdminDashboardClient data={data} error={error} query={query} />
}
