/**
 * middleware.ts
 * Global Next.js middleware — runs on every request before page/route handlers.
 *
 * Responsibilities:
 *  - Refresh Supabase auth sessions via cookies
 *  - Protect dashboard routes (redirect to /login if unauthenticated)
 *  - Redirect authenticated users away from auth pages
 *  - Attach security headers to every response
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Security Headers ─────────────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Stop browsers from MIME-sniffing
  'X-Content-Type-Options': 'nosniff',
  // Only send referrer on same origin
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Disable browser features not needed by the app
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Enforce HTTPS for 1 year
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires these
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "media-src 'self' blob: https://*.proxy.jarvislabs.net https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co https://*.proxy.jarvislabs.net",
    "frame-ancestors 'none'"
  ].join('; ')
}

// ─── Middleware Function ──────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // Create a mutable response so we can attach cookies + headers
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Initialize Supabase server client with cookie support
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write cookies to both the request and response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Refresh session — this keeps the user logged in across navigations
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Routes that require an authenticated session
  const isProtected = pathname.startsWith('/studio') ||
                      pathname.startsWith('/gallery') ||
                      pathname.startsWith('/settings') ||
                      pathname.startsWith('/admin')

  // Auth pages that logged-in users should leave
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (!user && isProtected) {
    // Unauthenticated user trying to access a protected page → login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    // Already logged-in user on login/signup → send to studio
    return NextResponse.redirect(new URL('/studio', request.url))
  }

  // Attach security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// ─── Matcher: apply middleware to all routes except static assets ─────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
