import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Short-circuit if env vars are missing to avoid crash
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Protected route logic
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
  } catch (e) {
    console.error('Proxy Error:', e)
    return response
  }
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
