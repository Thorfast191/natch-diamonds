export type StoryKey = 'collection' | 'bespoke' | 'sourcing'

export interface StoryPanel {
  key: StoryKey
  title: string
  body: string
}

export const STORY_PANELS: StoryPanel[] = [
  {
    key: 'collection',
    title: 'The Collection',
    body: 'Ready-to-order pieces from The Studs, The Hoops, and The Tennis — designed once, cut precisely, available now.',
  },
  {
    key: 'bespoke',
    title: 'Bespoke',
    body: 'A piece built around one idea: yours. Guided from the first sketch to the final polish.',
  },
  {
    key: 'sourcing',
    title: 'Sourcing',
    body: 'Natural or lab-grown, private client or trade buyer — stones sourced and verified to the specification you set.',
  },
]

export function getStoryIndex(progress: number): 0 | 1 | 2 {
  if (progress < 1 / 3) return 0
  if (progress < 2 / 3) return 1
  return 2
}
