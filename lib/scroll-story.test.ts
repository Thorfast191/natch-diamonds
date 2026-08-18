import { describe, expect, it } from 'vitest'
import { STORY_PANELS } from './scroll-story'

describe('STORY_PANELS', () => {
  it('has exactly three panels in order: collection, bespoke, sourcing', () => {
    expect(STORY_PANELS.map((panel) => panel.key)).toEqual(['collection', 'bespoke', 'sourcing'])
  })
})
