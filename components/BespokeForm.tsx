'use client'

import { useState, useTransition } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CldUploadWidget } from 'next-cloudinary'
import { submitBespokeInquiry } from '@/actions/bespoke'
import { EASE } from '@/lib/motion'

export function BespokeForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const reduced = useReducedMotion()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await submitBespokeInquiry({
          name,
          email,
          description,
          inspirationImageUrl: imageUrl ?? undefined,
        })
        if (!result.success) {
          setErrors(result.errors ?? [])
          return
        }
        setErrors([])
        setSuccess(true)
      } catch (error) {
        console.error('Failed to submit bespoke inquiry', error)
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
        className="rounded border border-gold/40 bg-ivory px-8 py-12 text-center"
      >
        <h3 className="font-display text-2xl text-ink">Thank you, {name.split(' ')[0] || 'there'}.</h3>
        <p className="mt-2 text-ink/70">
          We&apos;ve received your bespoke inquiry and will be in touch shortly.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="bespoke-form">
      <div>
        <label htmlFor="bespoke-name" className="block text-sm text-ink/70">
          Name
        </label>
        <input
          id="bespoke-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="bespoke-email" className="block text-sm text-ink/70">
          Email
        </label>
        <input
          id="bespoke-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="bespoke-description" className="block text-sm text-ink/70">
          Describe the piece you have in mind
        </label>
        <textarea
          id="bespoke-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <span className="block text-sm text-ink/70">Inspiration photo (optional)</span>
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result) => {
            const info = result?.info
            if (info && typeof info === 'object' && 'secure_url' in info) {
              setImageUrl(String((info as { secure_url: string }).secure_url))
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="mt-2 rounded-full border border-ink/20 px-4 py-2 text-sm transition-colors hover:border-gold"
            >
              {imageUrl ? 'Replace photo' : 'Upload photo'}
            </button>
          )}
        </CldUploadWidget>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Inspiration preview" className="mt-4 h-32 w-32 object-cover" />
        )}
      </div>
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
        className="rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  )
}
