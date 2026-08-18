import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProduct } from '@/actions/products'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Products</h2>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-5 py-2 text-xs uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
                <th className="py-2 pr-4">Image</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Collection</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-ink/10">
                  <td className="py-3 pr-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 object-cover"
                    />
                  </td>
                  <td className="py-3 pr-4">{product.name}</td>
                  <td className="py-3 pr-4">{product.collection}</td>
                  <td className="py-3 pr-4">${product.price.toLocaleString('en-US')}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-gold"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteProduct.bind(null, product.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
