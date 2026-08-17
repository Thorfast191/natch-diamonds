const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface BespokeInput {
  name: string
  email: string
  description: string
  inspirationImageUrl?: string
}

export function validateBespokeInput(input: BespokeInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.push('A valid email is required.')
  if (!input.description.trim()) errors.push('Please describe the piece you have in mind.')
  return errors
}

export interface SourcingInput {
  name: string
  email: string
  buyerType: string
  companyName?: string
  interest: string
  details: string
}

export function validateSourcingInput(input: SourcingInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.push('A valid email is required.')
  if (!['private', 'trade'].includes(input.buyerType)) errors.push('Select a buyer type.')
  if (input.buyerType === 'trade' && !input.companyName?.trim()) {
    errors.push('Company name is required for trade buyers.')
  }
  if (!['natural', 'lab-grown', 'both'].includes(input.interest)) {
    errors.push('Select a diamond interest.')
  }
  if (!input.details.trim()) errors.push('Please add a few details about what you are sourcing.')
  return errors
}
