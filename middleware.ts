import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Diagnostic logging for Vercel troubleshooting
  console.log('Middleware Invoked - URL:', request.nextUrl.pathname)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) console.error('MISSING env var: NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) console.error('MISSING env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

  // Create an unmodified client purely for session update
  let supabase;
  try {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
  } catch (err) {
    console.error('Supabase Client Error in Middleware:', err)
    return supabaseResponse
  }

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/studio') ||
                           request.nextUrl.pathname.startsWith('/gallery') ||
                           request.nextUrl.pathname.startsWith('/affiliate') ||
                           request.nextUrl.pathname.startsWith('/settings');

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup');

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/studio'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhook (webhooks don't need auth session)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
