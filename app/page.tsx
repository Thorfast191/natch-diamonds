import { prisma } from '@/lib/prisma'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { CollectionGrid } from '@/components/CollectionGrid'
import { ScrollStory } from '@/components/ScrollStory'
import { BespokeForm } from '@/components/BespokeForm'
import { SourcingForm } from '@/components/SourcingForm'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <main>
      <Nav />
      <Hero />
      <CollectionGrid products={products} />
      <ScrollStory />
      <section id="bespoke" className="border-t border-ink/10 px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Bespoke</h2>
          <p className="mt-4 text-ink/70">
            Tell us what you have in mind, and share a photo if you have one.
          </p>
          <div className="mt-12">
            <BespokeForm />
          </div>
        </div>
      </section>
      <section id="sourcing" className="border-t border-ink/10 px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Diamond Sourcing</h2>
          <p className="mt-4 text-ink/70">
            For private clients and trade buyers sourcing natural or lab-grown stones.
          </p>
          <div className="mt-12">
            <SourcingForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
