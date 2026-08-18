'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-guard'

export interface DeleteActionResult {
  success: boolean
  error?: string
}

export async function deleteOrder(id: string): Promise<DeleteActionResult> {
  await requireAdminSession()
  try {
    await prisma.order.delete({ where: { id } })
  } catch (error) {
    console.error('Failed to delete order', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function deleteBespokeInquiry(id: string): Promise<DeleteActionResult> {
  await requireAdminSession()
  try {
    await prisma.bespokeInquiry.delete({ where: { id } })
  } catch (error) {
    console.error('Failed to delete bespoke inquiry', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/admin/bespoke')
  return { success: true }
}

export async function deleteSourcingInquiry(id: string): Promise<DeleteActionResult> {
  await requireAdminSession()
  try {
    await prisma.sourcingInquiry.delete({ where: { id } })
  } catch (error) {
    console.error('Failed to delete sourcing inquiry', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/admin/sourcing')
  return { success: true }
}
