'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE, STAGGER_CHILDREN } from '@/lib/motion'
import type { Product } from '@prisma/client'

const imageVariants = { rest: { scale: 1 }, hover: { scale: 1.05 } }
const underlineVariants = { rest: { width: 0 }, hover: { width: '100%' } }

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const hoverState = !reduced && hovered ? 'hover' : 'rest'

  return (
    <motion.article
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: reduced ? 0.4 : 0.7,
        delay: reduced ? 0 : index * STAGGER_CHILDREN,
        ease: EASE,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="overflow-hidden">
        <motion.img
          src={product.imageUrl}
          alt={product.name}
          variants={imageVariants}
          animate={hoverState}
          transition={{ duration: 0.7, ease: EASE }}
          className="aspect-square w-full object-cover"
        />
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-gold">{product.collection}</p>
        <h3 className="relative mt-1 inline-block font-display text-xl text-ink">
          {product.name}
          <motion.span
            variants={underlineVariants}
            animate={hoverState}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute -bottom-1 left-0 h-px bg-gold"
          />
        </h3>
        <p className="mt-1 text-sm text-ink/70">${product.price.toLocaleString('en-US')}</p>
      </div>
    </motion.article>
  )
}
