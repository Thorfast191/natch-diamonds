import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/Hero'
import { CollectionGrid } from '@/components/CollectionGrid'
import { ScrollStory } from '@/components/ScrollStory'
import { BespokeForm } from '@/components/BespokeForm'

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <main>
      <Hero />
      <CollectionGrid products={products} />
      <ScrollStory />
      <section className="mx-auto max-w-2xl px-6 py-24">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Bespoke</h2>
        <p className="mt-4 text-ink/70">
          Tell us what you have in mind, and share a photo if you have one.
        </p>
        <div className="mt-12">
          <BespokeForm />
        </div>
      </section>
    </main>
  )
}
