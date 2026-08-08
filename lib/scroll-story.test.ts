import { describe, expect, it } from 'vitest'
import { getStoryIndex, STORY_PANELS } from './scroll-story'

describe('STORY_PANELS', () => {
  it('has exactly three panels in order: collection, bespoke, sourcing', () => {
    expect(STORY_PANELS.map((panel) => panel.key)).toEqual(['collection', 'bespoke', 'sourcing'])
  })
})

describe('getStoryIndex', () => {
  it('returns 0 for the first third', () => {
    expect(getStoryIndex(0)).toBe(0)
    expect(getStoryIndex(0.32)).toBe(0)
  })

  it('returns 1 for the middle third', () => {
    expect(getStoryIndex(0.34)).toBe(1)
    expect(getStoryIndex(0.65)).toBe(1)
  })

  it('returns 2 for the final third', () => {
    expect(getStoryIndex(0.67)).toBe(2)
    expect(getStoryIndex(1)).toBe(2)
  })
})
