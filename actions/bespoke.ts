'use server'

import { prisma } from '@/lib/prisma'
import { validateBespokeInput, type BespokeInput } from './validation'

export interface BespokeActionResult {
  success: boolean
  errors?: string[]
}

export async function submitBespokeInquiry(input: BespokeInput): Promise<BespokeActionResult> {
  const errors = validateBespokeInput(input)
  if (errors.length > 0) return { success: false, errors }

  await prisma.bespokeInquiry.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim(),
      description: input.description.trim(),
      inspirationImageUrl: input.inspirationImageUrl || null,
    },
  })

  return { success: true }
}
