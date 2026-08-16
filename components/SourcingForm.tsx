'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { submitSourcingInquiry } from '@/actions/sourcing'

type BuyerType = 'private' | 'trade'
type Interest = 'natural' | 'lab-grown' | 'both'

export function SourcingForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [buyerType, setBuyerType] = useState<BuyerType>('private')
  const [companyName, setCompanyName] = useState('')
  const [interest, setInterest] = useState<Interest>('natural')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const reduced = useReducedMotion()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await submitSourcingInquiry({
          name,
          email,
          buyerType,
          companyName: buyerType === 'trade' ? companyName : undefined,
          interest,
          details,
        })
        if (!result.success) {
          setErrors(result.errors ?? [])
          return
        }
        setErrors([])
        setSuccess(true)
      } catch (error) {
        console.error('Failed to submit sourcing inquiry', error)
        setErrors(['Something went wrong. Please try again.'])
      }
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.4 : 0.6, ease: EASE }}
        className="rounded border border-gold/40 bg-charcoal px-8 py-12 text-center text-white"
      >
        <h3 className="font-display text-2xl">Thank you, {name.split(' ')[0] || 'there'}.</h3>
        <p className="mt-2 text-white/70">Our sourcing team will follow up shortly.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="sourcing-form">
      <div role="radiogroup" aria-label="Buyer type" className="flex gap-4">
        {(['private', 'trade'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setBuyerType(type)}
            aria-pressed={buyerType === type}
            className={`border px-4 py-2 text-sm uppercase tracking-wide ${
              buyerType === type ? 'border-gold text-gold' : 'border-white/30 text-white/70'
            }`}
          >
            {type === 'private' ? 'Private Client' : 'Trade / Professional'}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="sourcing-name" className="block text-sm text-white/70">
          Name
        </label>
        <input
          id="sourcing-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="sourcing-email" className="block text-sm text-white/70">
          Email
        </label>
        <input
          id="sourcing-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      <AnimatePresence>
        {buyerType === 'trade' && (
          <motion.div
            key="company-name"
            initial={{ opacity: 0, height: reduced ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: reduced ? 'auto' : 0 }}
            transition={{ duration: reduced ? 0.4 : 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <label htmlFor="sourcing-company" className="block text-sm text-white/70">
              Company name
            </label>
            <input
              id="sourcing-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
              required
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="sourcing-interest" className="block text-sm text-white/70">
          Diamond interest
        </label>
        <select
          id="sourcing-interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value as Interest)}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
        >
          <option value="natural" className="text-ink">
            Natural
          </option>
          <option value="lab-grown" className="text-ink">
            Lab-grown
          </option>
          <option value="both" className="text-ink">
            Both
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="sourcing-details" className="block text-sm text-white/70">
          Details
        </label>
        <textarea
          id="sourcing-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-white/30 bg-transparent py-2 text-white focus:border-gold focus:outline-none"
          required
        />
      </div>

      {errors.length > 0 && (
        <ul className="text-sm text-red-400">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-gold px-8 py-3 text-sm uppercase tracking-widest text-charcoal hover:bg-white disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  )
}
