import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // This will refresh the session if needed
  const { data: { user } } = await supabase.auth.getUser()

  // Protected route logic (formerly in middleware.ts)
  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/studio') || 
                      path.startsWith('/gallery') || 
                      path.startsWith('/settings') || 
                      path.startsWith('/admin')
  
  const isAuth = path.startsWith('/login') || path.startsWith('/signup')

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuth) {
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
