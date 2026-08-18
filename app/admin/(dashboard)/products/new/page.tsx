import { ProductForm } from '@/components/admin/ProductForm'
import { createProduct } from '@/actions/products'

export default function NewProductPage() {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Add Product</h2>
      <div className="mt-6">
        <ProductForm action={createProduct} />
      </div>
    </div>
  )
}
