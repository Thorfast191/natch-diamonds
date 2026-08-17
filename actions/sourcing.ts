'use server'

import { prisma } from '@/lib/prisma'
import { validateSourcingInput, type SourcingInput } from './validation'

export interface SourcingActionResult {
  success: boolean
  errors?: string[]
}

export async function submitSourcingInquiry(input: SourcingInput): Promise<SourcingActionResult> {
  const errors = validateSourcingInput(input)
  if (errors.length > 0) return { success: false, errors }

  try {
    await prisma.sourcingInquiry.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        buyerType: input.buyerType,
        companyName: input.buyerType === 'trade' ? input.companyName?.trim() || null : null,
        interest: input.interest,
        details: input.details.trim(),
      },
    })
  } catch (error) {
    console.error('Failed to create sourcing inquiry', error)
    return { success: false, errors: ['Something went wrong. Please try again.'] }
  }

  return { success: true }
}
