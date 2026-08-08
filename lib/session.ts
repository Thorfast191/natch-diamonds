import { createHmac, timingSafeEqual } from 'crypto'

export const SESSION_COOKIE_NAME = 'natch_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function checkPassword(candidate: string): boolean {
  const expected = getSecret()
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function createSessionToken(now: number = Date.now()): string {
  const expiry = String(now + SESSION_TTL_MS)
  return `${expiry}.${sign(expiry)}`
}

export function verifySessionToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false
  const [expiry, signature] = token.split('.')
  if (!expiry || !signature) return false
  if (sign(expiry) !== signature) return false
  return Number(expiry) > now
}
