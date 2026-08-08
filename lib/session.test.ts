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

  it('accepts the correct password', () => {
    expect(checkPassword('test-password-123')).toBe(true)
  })

  it('rejects an incorrect password', () => {
    expect(checkPassword('wrong')).toBe(false)
  })

  it('round-trips a freshly created session token', () => {
    const token = createSessionToken()
    expect(verifySessionToken(token)).toBe(true)
  })

  it('rejects a tampered token', () => {
    const token = createSessionToken()
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')
    expect(verifySessionToken(tampered)).toBe(false)
  })

  it('rejects an expired token', () => {
    const now = Date.now()
    const token = createSessionToken(now)
    const nineHoursLater = now + 1000 * 60 * 60 * 9
    expect(verifySessionToken(token, nineHoursLater)).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(verifySessionToken(undefined)).toBe(false)
  })
})
