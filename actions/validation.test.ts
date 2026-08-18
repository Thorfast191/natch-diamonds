import { describe, expect, it } from 'vitest'
import {
  validateBespokeInput,
  validateCheckoutInput,
  validateProductInput,
  validateSourcingInput,
} from './validation'

describe('validateBespokeInput', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', description: 'A custom ring.' }

  it('accepts valid input', () => {
    expect(validateBespokeInput(valid)).toEqual([])
  })

  it('rejects a missing name', () => {
    expect(validateBespokeInput({ ...valid, name: '  ' })).toContain('Name is required.')
  })

  it('rejects a malformed email', () => {
    expect(validateBespokeInput({ ...valid, email: 'not-an-email' })).toContain(
      'A valid email is required.'
    )
  })

  it('rejects a missing description', () => {
    expect(validateBespokeInput({ ...valid, description: '' })).toContain(
      'Please describe the piece you have in mind.'
    )
  })
})

describe('validateSourcingInput', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    buyerType: 'private',
    interest: 'natural',
    details: 'Looking for a 2-carat round brilliant.',
  }

  it('accepts valid private-client input', () => {
    expect(validateSourcingInput(valid)).toEqual([])
  })

  it('requires a company name for trade buyers', () => {
    const errors = validateSourcingInput({ ...valid, buyerType: 'trade', companyName: undefined })
    expect(errors).toContain('Company name is required for trade buyers.')
  })

  it('accepts trade buyers that provide a company name', () => {
    const errors = validateSourcingInput({
      ...valid,
      buyerType: 'trade',
      companyName: 'Acme Jewels',
    })
    expect(errors).toEqual([])
  })

  it('rejects an invalid interest value', () => {
    expect(validateSourcingInput({ ...valid, interest: 'synthetic' })).toContain(
      'Select a diamond interest.'
    )
  })

  it('rejects an invalid buyer type', () => {
    expect(validateSourcingInput({ ...valid, buyerType: 'wholesale' })).toContain(
      'Select a buyer type.'
    )
  })
})

describe('validateCheckoutInput', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    addressLine1: '123 Main St',
    city: 'New York',
    region: 'NY',
    postalCode: '10001',
    country: 'USA',
    items: [{ productId: 'p1', quantity: 2 }],
  }

  it('accepts valid input', () => {
    expect(validateCheckoutInput(valid)).toEqual([])
  })

  it('rejects a missing name', () => {
    expect(validateCheckoutInput({ ...valid, name: '' })).toContain('Name is required.')
  })

  it('rejects a malformed email', () => {
    expect(validateCheckoutInput({ ...valid, email: 'not-an-email' })).toContain(
      'A valid email is required.'
    )
  })

  it('requires an address, city, region, postal code, and country', () => {
    const errors = validateCheckoutInput({
      ...valid,
      addressLine1: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    })
    expect(errors).toEqual(
      expect.arrayContaining([
        'Address is required.',
        'City is required.',
        'State / region is required.',
        'Postal code is required.',
        'Country is required.',
      ])
    )
  })

  it('rejects an empty cart', () => {
    expect(validateCheckoutInput({ ...valid, items: [] })).toContain('Your cart is empty.')
  })

  it('rejects an item with an invalid quantity', () => {
    expect(
      validateCheckoutInput({ ...valid, items: [{ productId: 'p1', quantity: 0 }] })
    ).toContain('Your cart contains an invalid item.')
  })
})

describe('validateProductInput', () => {
  const valid = {
    name: 'Solitaire Studs',
    collection: 'The Studs',
    price: 128000,
    imageUrl: 'https://example.com/image.jpg',
    description: 'A classic pair.',
  }

  it('accepts valid input', () => {
    expect(validateProductInput(valid)).toEqual([])
  })

  it('rejects a missing name', () => {
    expect(validateProductInput({ ...valid, name: '  ' })).toContain('Name is required.')
  })

  it('rejects a collection outside the fixed set', () => {
    expect(validateProductInput({ ...valid, collection: 'The Rings' })).toContain(
      'Select a valid collection.'
    )
  })

  it('rejects a zero or negative price', () => {
    expect(validateProductInput({ ...valid, price: 0 })).toContain(
      'Price must be a positive number.'
    )
    expect(validateProductInput({ ...valid, price: -50 })).toContain(
      'Price must be a positive number.'
    )
  })

  it('rejects a missing image', () => {
    expect(validateProductInput({ ...valid, imageUrl: '' })).toContain('An image is required.')
  })
})
