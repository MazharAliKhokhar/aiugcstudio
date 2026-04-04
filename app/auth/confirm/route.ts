import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/studio'

  const supabase = await createClient()

  const getRedirectUrl = async (user: any) => {
    // For password reset, always send to reset-password page
    if (next && next !== '/studio') return next
    try {
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('is_admin')
        .eq('id', user.id)
        .single()
      return profile?.is_admin ? '/admin' : '/studio'
    } catch {
      return '/studio'
    }
  }

  // Case 1: PKCE Flow (OAuth / magic link with code)
  if (code) {
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && user) {
      const redirectTo = await getRedirectUrl(user)
      return NextResponse.redirect(new URL(redirectTo, origin))
    }
    console.error('[auth/confirm] PKCE exchange failed:', error?.message)
  }

  // Case 2: Email OTP / Password Reset (token_hash)
  if (token_hash && type) {
    const { data: { user }, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error && user) {
      const redirectTo = await getRedirectUrl(user)
      return NextResponse.redirect(new URL(redirectTo, origin))
    }
    console.error('[auth/confirm] OTP verify failed:', error?.message)
  }

  // Fallback — token missing or expired
  return NextResponse.redirect(
    new URL('/login?error=Link+expired+or+invalid.+Please+request+a+new+one.', origin)
  )
}
