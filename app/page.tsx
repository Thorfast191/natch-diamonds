import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/Hero'
import { CollectionGrid } from '@/components/CollectionGrid'

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <main>
      <Hero />
      <CollectionGrid products={products} />
    </main>
  )
}
