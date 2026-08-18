import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { AddToCartPanel } from '@/components/AddToCartPanel'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) notFound()

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">{product.collection}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-lg text-ink/70">${product.price.toLocaleString('en-US')}</p>
            {product.description && (
              <p className="mt-6 max-w-md text-ink/70">{product.description}</p>
            )}
            <AddToCartPanel product={product} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
