'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  // Bypassed for public access - can be re-enabled later
  return true
}

export async function getAdminStats(query: string = '') {
  const adminClient = createAdminClient()
  
  const [
    { count: usersCount },
    { count: videosCount },
    { count: successfulVideos },
    { count: failedVideos },
    { data: allCredits },
    { count: weeklyUsersCount }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('videos').select('*', { count: 'exact', head: true }),
    adminClient.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    adminClient.from('profiles').select('credits'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ])
  
  const totalCredits = allCredits?.reduce((acc: number, p: any) => acc + (p.credits || 0), 0) || 0

  // Users
  let usersQuery = (adminClient.from('profiles') as any).select('*, videos!left(id)').order('created_at', { ascending: false }).limit(50)
  if (query) usersQuery = usersQuery.ilike('email', `%${query}%`)
  const { data: rawUsersList, error: usersError } = await usersQuery
  if (usersError) throw usersError
  
  // Videos
  const { data: videosList } = await adminClient.from('videos').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50)

  // Audit
  const { data: creditLogs } = await (adminClient.from('credit_logs') as any).select('*, profiles(email)').order('created_at', { ascending: false }).limit(50)

  return {
    usersCount: usersCount || 0,
    videosCount: videosCount || 0,
    successRate: videosCount ? Math.round(((successfulVideos || 0) / videosCount) * 100) : 0,
    failedVideos: failedVideos || 0,
    totalCredits,
    weeklyUsersCount: weeklyUsersCount || 0,
    usersList: rawUsersList?.map((u: any) => ({ ...u, videoCount: u.videos?.length || 0 })) || [],
    videosList: videosList || [],
    creditLogs: creditLogs || [],
    recentSignups: rawUsersList?.slice(0, 5) || []
  }
}

export async function updateUserCredits(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const userId = formData.get('userId') as string
  const credits = parseInt(formData.get('credits') as string, 10)

  if (!userId || isNaN(credits)) return { success: false, message: 'Invalid data: userId or credits missing' }

  try {
    const supabase = createAdminClient()

    const { data: updatedRows, error: updateError } = await (supabase.from('profiles') as any)
      .upsert({ id: userId, credits }, { onConflict: 'id' })
      .select('email, credits')

    if (updateError) return { success: false, message: `DB Error: ${updateError.message}` }
    if (!updatedRows || updatedRows.length === 0) return { success: false, message: 'User not found' }

    revalidatePath('/admin')
    revalidatePath('/studio')
    revalidatePath('/gallery')
    revalidatePath('/settings')
    return { success: true, message: `Credits updated to ${credits}` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function updateUserProfile(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const creditsStr = formData.get('credits') as string
  const credits = creditsStr ? parseInt(creditsStr, 10) : undefined

  if (!userId) return { success: false, message: 'User ID is required' }

  try {
    const supabase = createAdminClient()
    const updateData: any = {}
    if (fullName !== undefined) updateData.full_name = fullName
    if (credits !== undefined && !isNaN(credits)) updateData.credits = credits

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: 'No fields to update' }
    }

    const { data: updatedData, error } = await (supabase.from('profiles') as any)
      .upsert({ id: userId, ...updateData }, { onConflict: 'id' })
      .select('email, credits, full_name')

    if (error) return { success: false, message: `DB Error: ${error.message} (${error.code})` }
    if (!updatedData || updatedData.length === 0) return { success: false, message: 'No profile found with that ID' }

    revalidatePath('/admin')
    revalidatePath('/studio')
    revalidatePath('/gallery')
    revalidatePath('/settings')
    return { success: true, message: `Saved! ${updatedData[0].email} now has ${updatedData[0].credits} credits` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
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
      .update({ is_admin: !isAdmin })
      .eq('id', userId)

    if (error) return { success: false, message: `DB Error: ${error.message}` }

    revalidatePath('/admin')
    return { success: true, message: `Admin status ${!isAdmin ? 'granted' : 'revoked'}` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function createManualUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const credits = parseInt(formData.get('credits') as string, 10) || 0

  if (!email || !password) return { success: false, message: 'Missing email or password' }

  try {
    const adminClient = createAdminClient()
    
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (userError) return { success: false, message: userError.message }

    const { error: profileError } = await (adminClient.from('profiles') as any)
      .upsert({ id: userData.user.id, credits, email }, { onConflict: 'id' })
    
    if (profileError) throw profileError

    revalidatePath('/admin')
    revalidatePath('/studio')
    revalidatePath('/gallery')
    revalidatePath('/settings')
    return { success: true, message: `User ${email} created with ${credits} credits!` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function deleteVideo(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const videoId = formData.get('videoId') as string
  if (!videoId) return { success: false, message: 'Video ID required' }

  try {
    const supabase = createAdminClient()
    const { error } = await (supabase.from('videos') as any).delete().eq('id', videoId)
    if (error) return { success: false, message: `DB Error: ${error.message}` }
    revalidatePath('/admin')
    return { success: true, message: 'Video deleted' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function refundVideo(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  
  if (!videoId || !userId) return { success: false, message: 'Video ID and User ID required' }

  try {
    const supabase = createAdminClient()

    const { data: video } = await (supabase.from('videos') as any).select('duration').eq('id', videoId).single()
    const refundAmount = video?.duration === 30 ? 2 : (video?.duration === 60 ? 4 : 1)

    await (supabase.from('videos') as any).update({ status: 'failed' }).eq('id', videoId)
    await (supabase as any).rpc('increment_credits', { p_user_id: userId, p_amount: refundAmount })

    revalidatePath('/admin')
    return { success: true, message: `Refunded ${refundAmount} credits` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
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
      await (supabase as any).rpc('increment_credits', { p_user_id: video.user_id, p_amount: refundAmount })
      count++
    }

    revalidatePath('/admin')
    return { success: true, message: `Refunded ${count} stuck videos.` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function updateVideoDetails(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const videoId = formData.get('videoId') as string
  const status = formData.get('status') as string
  const videoUrl = formData.get('videoUrl') as string
  const durationStr = formData.get('duration') as string
  const duration = durationStr ? parseInt(durationStr, 10) : undefined

  if (!videoId) return { success: false, message: 'Video ID required' }

  try {
    const supabase = createAdminClient()
    const updateData: any = {}
    if (status) updateData.status = status
    if (videoUrl) updateData.video_url = videoUrl
    if (duration && !isNaN(duration)) updateData.duration = duration

    const { error } = await (supabase.from('videos') as any).update(updateData).eq('id', videoId)
    if (error) return { success: false, message: `DB Error: ${error.message}` }

    revalidatePath('/admin')
    return { success: true, message: 'Video updated!' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function deleteUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!(await verifyAdmin())) return { success: false, message: 'Unauthorized' }
  
  const userId = formData.get('userId') as string
  if (!userId) return { success: false, message: 'User ID required' }

  try {
    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
    if (authError) throw authError
    revalidatePath('/admin')
    return { success: true, message: 'User account permanently deleted.' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Unexpected error' }
  }
}

export async function syncDatabase(): Promise<{ success: boolean; message: string }> {
  revalidatePath('/admin')
  return { success: true, message: 'Synced!' }
}
