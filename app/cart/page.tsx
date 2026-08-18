'use client'

import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { useCart } from '@/components/CartProvider'
import { MAX_QUANTITY } from '@/lib/cart'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Cart</h1>

        {items.length === 0 ? (
          <div className="mt-12">
            <p className="text-ink/70">Your cart is empty.</p>
            <Link
              href="/#collection"
              className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 divide-y divide-ink/10">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-lg text-ink">{item.name}</p>
                    <p className="mt-1 text-sm text-ink/60">${item.price.toLocaleString('en-US')}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-ink/20">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-ink/60 transition-colors hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= MAX_QUANTITY}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-ink/60 transition-colors hover:text-ink disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs uppercase tracking-widest text-ink/40 underline underline-offset-4 hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-ink">
                    ${(item.price * item.quantity).toLocaleString('en-US')}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
              <p className="text-sm uppercase tracking-widest text-ink/60">Subtotal</p>
              <p className="font-display text-2xl text-ink">${subtotal.toLocaleString('en-US')}</p>
            </div>

            <Link
              href="/checkout"
              className="mt-8 block w-full rounded-full bg-ink px-8 py-3 text-center text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </section>
      <Footer />
    </main>
  )
}
