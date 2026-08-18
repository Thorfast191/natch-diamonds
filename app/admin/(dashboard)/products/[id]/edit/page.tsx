import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'
import { updateProduct } from '@/actions/products'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) notFound()

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Edit Product</h2>
      <div className="mt-6">
        <ProductForm initialProduct={product} action={updateProduct.bind(null, product.id)} />
      </div>
    </div>
  )
}
