'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createManualUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const credits = parseInt(formData.get('credits') as string, 10) || 0

  if (!email || !password) return { success: false, message: 'Missing email or password' }

  try {
    const adminClient = createAdminClient()
    
    // 1. Create the user in auth.users
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (userError) return { success: false, message: userError.message }

    // 2. Set credits
    const { error: profileError } = await (adminClient.from('profiles') as any)
      .update({ credits })
      .eq('id', userData.user.id)
    
    if (profileError) throw profileError

    // 3. Log the credit addition
    const { data: { user: admin } } = await (await createClient()).auth.getUser()
    const { error: logError } = await (adminClient.from('credit_logs') as any)
      .insert({
        user_id: userData.user.id,
        amount: credits,
        reason: 'Manual Account Creation',
        admin_id: admin?.id
      })
    
    if (logError) throw logError

    revalidatePath('/admin')
    return { success: true, message: 'User created successfully!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}

async function verifyAdmin() {
  // BYPASSED: Always return true to allow public access for debugging as requested
  return true;
}

export async function getAdminStats(query: string = '') {
  const adminClient = createAdminClient()
  
  // Stats
  const [
    { count: usersCount },
    { count: videosCount },
    { count: successfulVideos },
    { count: failedVideos },
    { data: allCredits }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('videos').select('*', { count: 'exact', head: true }),
    adminClient.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    adminClient.from('profiles').select('credits')
  ])
  
  const totalCredits = allCredits?.reduce((acc: any, p: any) => acc + (p.credits || 0), 0) || 0

  // Users
  let usersQuery = adminClient.from('profiles').select('*, videos!left(id)').order('created_at', { ascending: false }).limit(50)
  if (query) usersQuery = usersQuery.ilike('email', `%${query}%`)
  const { data: rawUsersList, error: usersError } = await usersQuery
  if (usersError) throw usersError
  
  // Videos
  const { data: videosList, error: videosError } = await adminClient.from('videos').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50)
  if (videosError) throw videosError

  // Audit
  const { data: creditLogs, error: auditError } = await adminClient.from('credit_logs').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50)
  if (auditError) throw auditError

  return {
    usersCount,
    videosCount,
    successRate: videosCount ? Math.round((successfulVideos || 0) / videosCount * 100) : 0,
    failedVideos,
    totalCredits,
    usersList: rawUsersList?.map((u: any) => ({ ...u, videoCount: u.videos?.length || 0 })),
    videosList,
    creditLogs,
    recentSignups: rawUsersList?.slice(0, 5)
  }
}

export async function updateUserCredits(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const userId = formData.get('userId') as string
  const credits = parseInt(formData.get('credits') as string, 10)

  if (!userId || isNaN(credits)) return { success: false, message: 'Invalid data' }

  try {
    const supabase = createAdminClient()
    
    // Get current credits for delta calculation
    const { data: profile, error: profileFetchError } = await (supabase.from('profiles') as any).select('credits').eq('id', userId).single()
    if (profileFetchError) throw profileFetchError

    const delta = profile ? credits - profile.credits : 0

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({ credits })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log the change
    const { data: { user: admin } } = await (await createClient()).auth.getUser()
    const { error: logError } = await (supabase.from('credit_logs') as any)
      .insert({
        user_id: userId,
        amount: delta,
        reason: 'Manual Administrative Adjustment',
        admin_id: admin?.id
      })
    
    if (logError) throw logError

    revalidatePath('/admin')
    return { success: true, message: 'Credits updated!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}

export async function toggleAdminStatus(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const userId = formData.get('userId') as string
  const isAdmin = formData.get('isAdmin') === 'true'

  if (!userId) return { success: false, message: 'User ID is required' }

  try {
    const supabase = createAdminClient()
    const { error } = await (supabase.from('profiles') as any)
      .update({ is_admin: !isAdmin }) // Toggle the current state
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true, message: 'Admin status toggled!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}

export async function deleteVideo(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const videoId = formData.get('videoId') as string

  if (!videoId) return { success: false, message: 'Video ID is required' }

  try {
    const supabase = createAdminClient()
    const { error } = await (supabase.from('videos') as any)
      .delete()
      .eq('id', videoId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true, message: 'Video deleted!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}

export async function refundVideo(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  
  if (!videoId || !userId) return { success: false, message: 'Video ID and User ID are required' }

  try {
    const supabase = createAdminClient()

    // 1. Mark video as failed
    const { error: updateError } = await (supabase.from('videos') as any)
      .update({ status: 'failed' })
      .eq('id', videoId)

    if (updateError) throw updateError

    // 2. Add credits back to user atomically
    const { data: video } = await (supabase.from('videos') as any).select('duration').eq('id', videoId).single()
    const refundAmount = video?.duration === 30 ? 2 : (video?.duration === 60 ? 4 : 1)

    const { error: rpcError } = await (supabase as any).rpc('increment_credits', { 
      p_user_id: userId, 
      p_amount: refundAmount 
    })

    if (rpcError) throw rpcError

    revalidatePath('/admin')
    return { success: true, message: 'Video refunded!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}

export async function bulkRefundStuckVideos(): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  try {
    const supabase = createAdminClient()
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    
    const { data: stuckVideos } = await (supabase.from('videos') as any)
      .select('id, user_id, duration')
      .in('status', ['pending', 'processing'])
      .lt('created_at', fifteenMinutesAgo)

    if (!stuckVideos || stuckVideos.length === 0) {
      return { success: true, message: 'No stuck videos found.' }
    }

    let count = 0
    for (const video of stuckVideos) {
      const refundAmount = video.duration === 30 ? 2 : (video.duration === 60 ? 4 : 1)
      
      await (supabase.from('videos') as any).update({ status: 'failed' }).eq('id', video.id)
      
      await (supabase as any).rpc('increment_credits', { 
        p_user_id: video.user_id, 
        p_amount: refundAmount 
      })

      count++
    }

    revalidatePath('/admin')
    return { success: true, message: `Successfully refunded ${count} videos.` }
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred' }
  }
}
