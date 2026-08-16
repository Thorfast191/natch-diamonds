import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  let isAuthenticated: boolean
  try {
    isAuthenticated = await verifySessionToken(token)
  } catch {
    // ADMIN_PASSWORD is unset, or another session-config problem
    // (misconfigured deployment) — treat as unauthenticated rather than
    // letting the exception surface as a 500.
    isAuthenticated = false
  }

  if (isAuthenticated) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
