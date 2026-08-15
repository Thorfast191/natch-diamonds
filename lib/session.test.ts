import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkPassword, createSessionToken, verifySessionToken } from './session'

describe('admin session', () => {
  const originalPassword = process.env.ADMIN_PASSWORD

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword
  })

  it('accepts the correct password', async () => {
    expect(await checkPassword('test-password-123')).toBe(true)
  })

  it('rejects an incorrect password', async () => {
    expect(await checkPassword('wrong')).toBe(false)
  })

  it('round-trips a freshly created session token', async () => {
    const token = await createSessionToken()
    expect(await verifySessionToken(token)).toBe(true)
  })

  it('rejects a tampered token', async () => {
    const token = await createSessionToken()
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')
    expect(await verifySessionToken(tampered)).toBe(false)
  })

  it('rejects an expired token', async () => {
    const now = Date.now()
    const token = await createSessionToken(now)
    const nineHoursLater = now + 1000 * 60 * 60 * 9
    expect(await verifySessionToken(token, nineHoursLater)).toBe(false)
  })

  it('rejects a missing token', async () => {
    expect(await verifySessionToken(undefined)).toBe(false)
  })
})
