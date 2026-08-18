'use server'

import { prisma } from '@/lib/prisma'
import { validateCheckoutInput, type CheckoutInput } from './validation'

export interface CheckoutActionResult {
  success: boolean
  orderId?: string
  errors?: string[]
}

export async function submitOrder(input: CheckoutInput): Promise<CheckoutActionResult> {
  const errors = validateCheckoutInput(input)
  if (errors.length > 0) return { success: false, errors }

  // Prices/names are looked up server-side rather than trusted from the
  // client, so a tampered cart payload can't produce a bogus-priced order.
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) } },
  })
  const productsById = new Map(products.map((product) => [product.id, product]))

  if (productsById.size !== new Set(input.items.map((item) => item.productId)).size) {
    return { success: false, errors: ['One or more items in your cart are no longer available.'] }
  }

  const orderItems = input.items.map((item) => {
    const product = productsById.get(item.productId)!
    return {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
    }
  })
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  try {
    const order = await prisma.order.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        city: input.city.trim(),
        region: input.region.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country.trim(),
        total,
        items: { create: orderItems },
      },
    })
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Failed to create order', error)
    return { success: false, errors: ['Something went wrong. Please try again.'] }
  }
}
