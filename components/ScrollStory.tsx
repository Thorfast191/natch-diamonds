'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE, STAGGER_CHILDREN } from '@/lib/motion'
import { STORY_PANELS } from '@/lib/scroll-story'

export function ScrollStory() {
  const reduced = !!useReducedMotion()

  return (
    <section className="border-t border-ink/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Three Houses, One Vision</p>
        <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {STORY_PANELS.map((panel, index) => (
            <motion.div
              key={panel.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: reduced ? 0.4 : 0.7,
                delay: reduced ? 0 : index * STAGGER_CHILDREN,
                ease: EASE,
              }}
            >
              <p className="font-display text-6xl leading-none text-ink/10" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-4 font-display text-2xl text-ink">{panel.title}</h3>
              <p className="mt-3 text-ink/60">{panel.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
