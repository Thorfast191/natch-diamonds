import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE_NAME, isAdminAuthenticated } from './session'

// The /admin/:path* middleware only gates requests that hit an /admin
// route — it says nothing about the action itself. Today every caller of
// these actions happens to live under /admin, but that's an accident of
// which pages import them, not something the type system enforces. Any
// mutating admin Server Action must check this directly so it can't
// silently become an unauthenticated mutation endpoint if it's ever wired
// up from somewhere else.
export async function requireAdminSession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!(await isAdminAuthenticated(token))) {
    redirect('/admin/login')
  }
}
