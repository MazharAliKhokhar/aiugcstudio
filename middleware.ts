import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session on every request
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected dashboard routes — require login
  const isDashboard = path.startsWith('/studio') ||
                      path.startsWith('/gallery') ||
                      path.startsWith('/settings')

  // Public auth routes — don't redirect logged-in users away
  const isAuth = path.startsWith('/login') ||
                 path.startsWith('/signup') ||
                 path.startsWith('/forgot-password') ||
                 path.startsWith('/reset-password')

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Only redirect logged-in users away from login/signup, not from password reset pages
  if (user && (path.startsWith('/login') || path.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/studio', request.url))
  }

  return response
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
