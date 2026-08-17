'use client'

import { MotionConfig } from 'framer-motion'

// Lets Framer Motion handle prefers-reduced-motion globally instead of each
// component manually branching its initial/animate props on
// useReducedMotion(). useReducedMotion() returns null/false during SSR (it
// can't read matchMedia on the server), so per-component branching on it
// caused a real SSR/CSR hydration mismatch for visitors whose OS already
// prefers reduced motion. reducedMotion="user" reads the media query before
// the first paint and automatically snaps transform-based values (x/y/scale/
// rotate) to their animate target when reduced motion is preferred, while
// still allowing opacity to animate — with no mismatch, because Framer
// applies this itself rather than us branching JSX on client-only state.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
