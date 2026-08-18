'use client'

import { useState, useTransition } from 'react'

interface DeleteButtonProps {
  onDelete: () => Promise<{ success: boolean; error?: string }>
  label?: string
}

export function DeleteButton({ onDelete, label = 'Delete' }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs uppercase tracking-widest text-ink/40 transition-colors hover:text-red-700"
      >
        {label}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await onDelete()
            if (!result.success) {
              setError(result.error ?? 'Something went wrong.')
              setConfirming(false)
            }
          })
        }
        className="text-xs uppercase tracking-widest text-red-700 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Confirm?'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs uppercase tracking-widest text-ink/40 hover:text-ink"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  )
}
