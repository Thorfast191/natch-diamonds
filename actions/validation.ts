import { COLLECTIONS } from '@/lib/collections'

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

export interface CheckoutInput {
  name: string
  email: string
  phone?: string
  addressLine1: string
  addressLine2?: string
  city: string
  region: string
  postalCode: string
  country: string
  items: { productId: string; quantity: number }[]
}

export function validateCheckoutInput(input: CheckoutInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.push('A valid email is required.')
  if (!input.addressLine1.trim()) errors.push('Address is required.')
  if (!input.city.trim()) errors.push('City is required.')
  if (!input.region.trim()) errors.push('State / region is required.')
  if (!input.postalCode.trim()) errors.push('Postal code is required.')
  if (!input.country.trim()) errors.push('Country is required.')
  if (input.items.length === 0) errors.push('Your cart is empty.')
  if (input.items.some((item) => !item.productId || item.quantity < 1)) {
    errors.push('Your cart contains an invalid item.')
  }
  return errors
}

export interface ProductInput {
  name: string
  collection: string
  price: number
  imageUrl: string
  description?: string
}

export function validateProductInput(input: ProductInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (!(COLLECTIONS as readonly string[]).includes(input.collection)) {
    errors.push('Select a valid collection.')
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    errors.push('Price must be a positive number.')
  }
  if (!input.imageUrl.trim()) errors.push('An image is required.')
  return errors
}
