import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, isAdminAuthenticated } from '@/lib/session'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (await isAdminAuthenticated(token)) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
