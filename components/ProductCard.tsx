'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE, STAGGER_CHILDREN } from '@/lib/motion'
import type { Product } from '@prisma/client'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduced = useReducedMotion()

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
      className="group"
    >
      <div className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-gold">{product.collection}</p>
        <h3 className="relative mt-1 inline-block font-display text-xl text-ink">
          {product.name}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 ease-out group-hover:w-full" />
        </h3>
        <p className="mt-1 text-sm text-ink/70">${product.price.toLocaleString('en-US')}</p>
      </div>
    </motion.article>
  )
}
