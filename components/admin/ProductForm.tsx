'use client'

import { useState, useTransition } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { COLLECTIONS } from '@/lib/collections'
import type { ProductInput } from '@/actions/validation'
import type { Product } from '@prisma/client'

interface ProductFormProps {
  initialProduct?: Product
  action: (input: ProductInput) => Promise<{ success: boolean; errors?: string[] }>
}

export function ProductForm({ initialProduct, action }: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? '')
  const [collection, setCollection] = useState(initialProduct?.collection ?? COLLECTIONS[0])
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '')
  const [description, setDescription] = useState(initialProduct?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl ?? '')
  const [errors, setErrors] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await action({
        name,
        collection,
        price: Number(price),
        imageUrl,
        description,
      })
      if (result && !result.success) {
        setErrors(result.errors ?? [])
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label htmlFor="product-name" className="block text-sm text-ink/70">
          Name
        </label>
        <input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="product-collection" className="block text-sm text-ink/70">
          Collection
        </label>
        <select
          id="product-collection"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
        >
          {COLLECTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="product-price" className="block text-sm text-ink/70">
          Price (USD)
        </label>
        <input
          id="product-price"
          type="number"
          min="1"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="product-description" className="block text-sm text-ink/70">
          Description
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <span className="block text-sm text-ink/70">Image</span>
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
              {imageUrl ? 'Replace image' : 'Upload image'}
            </button>
          )}
        </CldUploadWidget>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Product preview" className="mt-4 h-32 w-32 object-cover" />
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
        disabled={isPending || !imageUrl}
        className="rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {isPending ? 'Saving…' : initialProduct ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  )
}
