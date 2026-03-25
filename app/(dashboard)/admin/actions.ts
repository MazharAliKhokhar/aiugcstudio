'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true
}

export async function updateUserCredits(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  
  const userId = formData.get('userId') as string
  const credits = parseInt(formData.get('credits') as string, 10)

  if (!userId || isNaN(credits)) return

  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({ credits })
    .eq('id', userId)

  revalidatePath('/admin')
}

export async function toggleAdminStatus(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  
  const userId = formData.get('userId') as string
  const isAdmin = formData.get('isAdmin') === 'true'

  if (!userId) return

  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({ is_admin: !isAdmin }) // Toggle the current state
    .eq('id', userId)

  revalidatePath('/admin')
}

export async function deleteVideo(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  
  const videoId = formData.get('videoId') as string

  if (!videoId) return

  const supabase = await createClient()
  await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)

  revalidatePath('/admin')
}

export async function refundVideo(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  
  if (!videoId || !userId) return

  const supabase = await createClient()

  // 1. Mark video as failed
  await supabase
    .from('videos')
    .update({ status: 'failed' })
    .eq('id', videoId)

  // 2. Refund 1 or more credits. Since duration isn't cleanly tracked here for refunds without a lookup,
  // we'll fetch the video duration to refund accurately.
  const { data: video } = await supabase
    .from('videos')
    .select('duration')
    .eq('id', videoId)
    .single()

  if (video) {
    let refundAmount = 1
    if (video.duration === 30) refundAmount = 2
    if (video.duration === 60) refundAmount = 4

    // RPC credit addition (simulated via raw update for now)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits + refundAmount })
        .eq('id', userId)
    }
  }

  revalidatePath('/admin')
}
export async function bulkRefundStuckVideos() {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  
  // Find videos stuck in 'processing' or 'pending' created more than 15 minutes ago
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  
  const { data: stuckVideos } = await supabase
    .from('videos')
    .select('id, user_id, duration')
    .in('status', ['pending', 'processing'])
    .lt('created_at', fifteenMinutesAgo)

  if (!stuckVideos || stuckVideos.length === 0) return

  let refundCount = 0
  for (const video of stuckVideos) {
    // 1. Mark video as failed
    await supabase
      .from('videos')
      .update({ status: 'failed' })
      .eq('id', video.id)

    // 2. Calculate refund amount
    let refundAmount = 1
    if (video.duration === 30) refundAmount = 2
    if (video.duration === 60) refundAmount = 4

    // 3. Add credits back to user
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', video.user_id)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits + refundAmount })
        .eq('id', video.user_id)
      
      refundCount++
    }
  }

  revalidatePath('/admin')
}
