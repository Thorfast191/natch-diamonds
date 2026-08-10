'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { EASE } from '@/lib/motion'
import { STORY_PANELS, getStoryIndex } from '@/lib/scroll-story'

export function ScrollStory() {
  const reduced = !!useReducedMotion()

  return (
    <section className="bg-charcoal text-white">
      <h2 className="sr-only">Three Houses, One Vision</h2>
      <DesktopScrollStory reduced={reduced} />
      <MobileScrollStory reduced={reduced} />
    </section>
  )
}

function DesktopScrollStory({ reduced }: { reduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const [index, setIndex] = useState<0 | 1 | 2>(0)

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = getStoryIndex(value)
    setIndex((current) => (current === next ? current : next))
  })

  const panel = STORY_PANELS[index]

  return (
    <div ref={containerRef} className="relative hidden h-[300vh] md:block">
      <div className="sticky top-0 flex h-screen items-center gap-16 px-16">
        <div className="w-1/2">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Three Houses, One Vision</p>
        </div>
        <div className="w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.4 : 0.6, ease: EASE }}
            >
              <h3 className="font-display text-4xl">{panel.title}</h3>
              <p className="mt-4 max-w-md text-white/70">{panel.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function MobileScrollStory({ reduced }: { reduced: boolean }) {
  return (
    <div className="space-y-16 px-6 py-24 md:hidden">
      {STORY_PANELS.map((panel) => (
        <motion.div
          key={panel.key}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0.4 : 0.7, ease: EASE }}
        >
          <h3 className="font-display text-3xl">{panel.title}</h3>
          <p className="mt-4 text-white/70">{panel.body}</p>
        </motion.div>
      ))}
    </div>
  )
}
