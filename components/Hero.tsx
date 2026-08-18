'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

export function Hero() {
  const reduced = useReducedMotion()

  return (
    <section className="bg-ivory">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[600px]">
        <div className="flex flex-col justify-center gap-6 px-6 py-16 lg:px-16 lg:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.4 : 0.8, ease: EASE }}
            className="text-xs uppercase tracking-[0.25em] text-gold"
          >
            Fine Jewelry &middot; Natural &amp; Lab-Grown Diamonds
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.4 : 1, delay: reduced ? 0 : 0.1, ease: EASE }}
            className="font-display text-4xl text-ink sm:text-5xl"
          >
            Brilliance, on your terms.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.4 : 1, delay: reduced ? 0 : 0.2, ease: EASE }}
            className="max-w-md text-ink/70"
          >
            Certified natural and lab-grown diamonds. Ready to wear from the collection, or made
            entirely to your design.
          </motion.p>
          <motion.a
            href="#collection"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.4 : 1, delay: reduced ? 0 : 0.3, ease: EASE }}
            className="w-fit rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
          >
            View the Collection
          </motion.a>
        </div>
        <div className="relative h-[320px] lg:h-auto">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.4 : 1.5, ease: EASE }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1638734205377-f21045bf6ebe?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
