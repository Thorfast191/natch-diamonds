'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { MAX_QUANTITY } from '@/lib/cart'
import type { Product } from '@prisma/client'

export function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(
      { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl },
      quantity
    )
    setAdded(true)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-ink/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => {
              setQuantity((q) => Math.max(1, q - 1))
              setAdded(false)
            }}
            className="px-3 py-2 text-ink/60 transition-colors hover:text-ink"
          >
            −
          </button>
          <span className="w-8 text-center text-sm" data-testid="quantity-value">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => {
              setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
              setAdded(false)
            }}
            className="px-3 py-2 text-ink/60 transition-colors hover:text-ink"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
        >
          Add to Cart
        </button>
      </div>
      {added && (
        <p className="mt-4 text-sm text-ink/70">
          Added to cart.{' '}
          <Link href="/cart" className="underline underline-offset-4 hover:text-gold">
            View cart
          </Link>
        </p>
      )}
    </div>
  )
}
