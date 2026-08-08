import { describe, expect, it } from 'vitest'
import { EASE, STAGGER_CHILDREN } from './motion'

describe('EASE', () => {
  it('matches the brand ease curve', () => {
    expect(EASE).toEqual([0.22, 1, 0.36, 1])
  })
})

describe('STAGGER_CHILDREN', () => {
  it('is 0.15s per the brand stagger spec', () => {
    expect(STAGGER_CHILDREN).toBe(0.15)
  })
})
