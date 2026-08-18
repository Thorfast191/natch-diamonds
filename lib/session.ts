// Uses the Web Crypto API (globalThis.crypto.subtle) instead of Node's
// 'crypto' module so this file works in both the Node.js runtime and the
// Edge runtime (Next.js middleware always runs on the Edge runtime, which
// does not support Node's 'crypto' module).

export const SESSION_COOKIE_NAME = 'natch_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

// The admin login password. Checked against what the operator types in on
// the login form.
function getAdminPassword(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return secret
}

// The secret used to HMAC-sign session tokens. Deliberately separate from
// ADMIN_PASSWORD: session tokens are sent in a cookie that can leak (XSS,
// logging, a shared machine, etc.), and a leaked token's plaintext expiry +
// signature is otherwise an offline dictionary-attack oracle against
// whatever secret produced the signature. If SESSION_SECRET is recovered
// from a leaked cookie, the human-chosen admin password itself stays safe.
// Falls back to ADMIN_PASSWORD so nothing breaks if it's unset.
function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('SESSION_SECRET or ADMIN_PASSWORD must be set')
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
    new TextEncoder().encode(getSigningSecret()),
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
  const expected = getAdminPassword()
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
  const expected = new TextEncoder().encode(await sign(expiry))
  const actual = new TextEncoder().encode(signature)
  if (!timingSafeEqualBytes(expected, actual)) return false
  return Number(expiry) > now
}

export async function isAdminAuthenticated(token: string | undefined): Promise<boolean> {
  try {
    return await verifySessionToken(token)
  } catch {
    // ADMIN_PASSWORD is unset, or another session-config problem
    // (misconfigured deployment) — treat as unauthenticated rather than
    // letting the exception surface.
    return false
  }
}
