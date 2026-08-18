import { ProductCard } from './ProductCard'
import type { Product } from '@prisma/client'

const COLLECTIONS = ['The Studs', 'The Hoops', 'The Tennis'] as const

export function CollectionGrid({ products }: { products: Product[] }) {
  return (
    <section id="collection" className="mx-auto max-w-6xl px-6 py-24 scroll-mt-20">
      <h2 className="font-display text-3xl text-ink sm:text-4xl">
        The Studs · The Hoops · The Tennis
      </h2>
      <p className="mt-4 max-w-2xl text-ink/60">
        Three signature designs, cut and set to order. Each piece is available in your choice of
        natural or certified lab-grown diamonds.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.flatMap((collection) =>
          products
            .filter((product) => product.collection === collection)
            .map((product, i) => <ProductCard key={product.id} product={product} index={i} />)
        )}
      </div>
    </section>
  )
}
