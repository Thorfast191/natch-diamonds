'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { useCart } from '@/components/CartProvider'
import { submitOrder } from '@/actions/checkout'

const FIELDS = [
  { id: 'name', label: 'Full name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phone', label: 'Phone (optional)', type: 'text', required: false },
  { id: 'addressLine1', label: 'Address', type: 'text', required: true },
  { id: 'addressLine2', label: 'Apt / suite (optional)', type: 'text', required: false },
  { id: 'city', label: 'City', type: 'text', required: true },
  { id: 'region', label: 'State / region', type: 'text', required: true },
  { id: 'postalCode', label: 'Postal code', type: 'text', required: true },
  { id: 'country', label: 'Country', type: 'text', required: true },
] as const

type FieldId = (typeof FIELDS)[number]['id']
type FormState = Record<FieldId, string>

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [confirmation, setConfirmation] = useState<{
    orderId: string
    items: typeof items
    total: number
  } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await submitOrder({
          ...form,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        })
        if (!result.success || !result.orderId) {
          setErrors(result.errors ?? [])
          return
        }
        setErrors([])
        setConfirmation({ orderId: result.orderId, items, total: subtotal })
        clear()
      } catch (error) {
        console.error('Failed to submit order', error)
        setErrors(['Something went wrong. Please try again.'])
      }
    })
  }

  if (confirmation) {
    return (
      <main>
        <Nav />
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Thank you.</h1>
          <p className="mt-4 text-ink/70">
            Your order has been placed. Confirmation number: {confirmation.orderId}
          </p>
          <ul className="mt-10 divide-y divide-ink/10 text-left">
            {confirmation.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between py-4">
                <span className="text-ink/80">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-ink">
                  ${(item.price * item.quantity).toLocaleString('en-US')}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-6">
            <p className="text-sm uppercase tracking-widest text-ink/60">Total</p>
            <p className="font-display text-2xl text-ink">
              ${confirmation.total.toLocaleString('en-US')}
            </p>
          </div>
          <Link
            href="/"
            className="mt-10 inline-block rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
          >
            Back to Natch Diamonds
          </Link>
        </section>
        <Footer />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main>
        <Nav />
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Your cart is empty.</h1>
          <Link
            href="/#collection"
            className="mt-8 inline-block rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
          >
            Browse the Collection
          </Link>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Checkout</h1>
        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
            {FIELDS.map((field) => (
              <div key={field.id}>
                <label htmlFor={`checkout-${field.id}`} className="block text-sm text-ink/70">
                  {field.label}
                </label>
                <input
                  id={`checkout-${field.id}`}
                  type={field.type}
                  value={form[field.id]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                  required={field.required}
                  className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
                />
              </div>
            ))}
            {errors.length > 0 && (
              <ul className="text-sm text-red-700">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
            >
              {isPending ? 'Placing Order…' : 'Place Order'}
            </button>
          </form>

          <div>
            <h2 className="text-sm uppercase tracking-widest text-ink/60">Order Summary</h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between py-4">
                  <span className="text-ink/80">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-ink">
                    ${(item.price * item.quantity).toLocaleString('en-US')}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
              <p className="text-sm uppercase tracking-widest text-ink/60">Total</p>
              <p className="font-display text-2xl text-ink">${subtotal.toLocaleString('en-US')}</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
