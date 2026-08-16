'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

export function Hero() {
  const reduced = useReducedMotion()

  return (
    <section className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden bg-charcoal text-white">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 0.5, scale: 1 }}
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
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.4 : 1, ease: EASE }}
          className="font-display text-5xl tracking-[0.3em] sm:text-7xl"
        >
          NATCH DIAMONDS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.4 : 0.8, delay: reduced ? 0 : 0.3, ease: EASE }}
          className="mt-4 text-sm uppercase tracking-[0.2em] text-white/70"
        >
          Natural &amp; Lab-Grown, Cut for the Occasion
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3] }}
        transition={
          reduced
            ? { duration: 0.4, ease: EASE }
            : { duration: 1.5, repeat: Infinity, ease: EASE }
        }
        className="absolute bottom-10 h-16 w-px bg-gold"
        aria-hidden
      />
    </section>
  )
}
