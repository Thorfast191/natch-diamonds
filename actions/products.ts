'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-guard'
import { validateProductInput, type ProductInput } from './validation'

export interface ProductActionResult {
  success: boolean
  errors?: string[]
}

function toProductData(input: ProductInput) {
  return {
    name: input.name.trim(),
    collection: input.collection,
    price: Math.round(input.price),
    imageUrl: input.imageUrl.trim(),
    description: input.description?.trim() || '',
  }
}

export async function createProduct(input: ProductInput): Promise<ProductActionResult> {
  await requireAdminSession()
  const errors = validateProductInput(input)
  if (errors.length > 0) return { success: false, errors }

  try {
    await prisma.product.create({ data: toProductData(input) })
  } catch (error) {
    console.error('Failed to create product', error)
    return { success: false, errors: ['Something went wrong. Please try again.'] }
  }

  redirect('/admin')
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductActionResult> {
  await requireAdminSession()
  const errors = validateProductInput(input)
  if (errors.length > 0) return { success: false, errors }

  try {
    await prisma.product.update({ where: { id }, data: toProductData(input) })
  } catch (error) {
    console.error('Failed to update product', error)
    return { success: false, errors: ['Something went wrong. Please try again.'] }
  }

  redirect('/admin')
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession()
  try {
    await prisma.product.delete({ where: { id } })
  } catch (error) {
    console.error('Failed to delete product', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/admin')
  return { success: true }
}
