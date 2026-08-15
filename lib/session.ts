// Uses the Web Crypto API (globalThis.crypto.subtle) instead of Node's
// 'crypto' module so this file works in both the Node.js runtime and the
// Edge runtime (Next.js middleware always runs on the Edge runtime, which
// does not support Node's 'crypto' module).

export const SESSION_COOKIE_NAME = 'natch_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return secret
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return bufferToHex(signature)
}

// Constant-time comparison: always walks every byte rather than
// short-circuiting on the first mismatch, so comparison time doesn't leak
// information about how many leading bytes matched.
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = getSecret()
  const a = new TextEncoder().encode(candidate)
  const b = new TextEncoder().encode(expected)
  if (a.length !== b.length) return false
  return timingSafeEqualBytes(a, b)
}

export async function createSessionToken(now: number = Date.now()): Promise<string> {
  const expiry = String(now + SESSION_TTL_MS)
  return `${expiry}.${await sign(expiry)}`
}

export async function verifySessionToken(
  token: string | undefined,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false
  const [expiry, signature] = token.split('.')
  if (!expiry || !signature) return false
  if ((await sign(expiry)) !== signature) return false
  return Number(expiry) > now
}
