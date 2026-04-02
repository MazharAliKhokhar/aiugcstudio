'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: { user }, error } = await supabase.auth.signInWithPassword(data)

  if (error || !user) {
    return { error: error?.message || 'Login failed' }
  }

  // Check for admin status
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')
  
  if (profile?.is_admin) {
    redirect('/admin')
  }

  redirect('/studio')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      }
    }
  }

  const { data: { user }, error } = await supabase.auth.signUp(data)

  if (error || !user) {
    return { error: error?.message || 'Sign up failed' }
  }

  // Admin check (Unlikely for signup, but good for consistency)
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')

  if (profile?.is_admin) {
    redirect('/admin')
  }

  redirect('/studio')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const origin = formData.get('origin') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { data: { user }, error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error || !user) {
    return { error: error?.message || 'Update failed' }
  }

  // Check for admin status
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')

  if (profile?.is_admin) {
    redirect('/admin')
  }

  redirect('/studio')
}
