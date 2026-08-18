'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session'

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')

  let passwordIsValid: boolean
  try {
    passwordIsValid = await checkPassword(password)
  } catch {
    // ADMIN_PASSWORD is unset (misconfigured deployment) — treat as invalid
    // rather than letting the exception surface as a 500.
    passwordIsValid = false
  }

  if (!passwordIsValid) {
    redirect('/admin/login?error=1')
  }

  cookies().set(SESSION_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  redirect('/admin/login')
}
