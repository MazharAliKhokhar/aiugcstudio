import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  let next = searchParams.get('next')

  const supabase = await createClient()

  const getRedirectUrl = async (user: any) => {
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

  // Case 1: PKCE Flow (code)
  if (code) {
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && user) {
      return redirect(await getRedirectUrl(user))
    }
  }

  // Case 2: Email Link / OTP (token_hash)
  if (token_hash && type) {
    const { data: { user }, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error && user) {
      return redirect(await getRedirectUrl(user))
    }
  }

  // Error case: Fallback to login with error message
  return redirect('/login?error=Verification failed or link expired')
}
