import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: 'Solitaire Studs',
    collection: 'The Studs',
    price: 128000,
    imageUrl:
      'https://images.unsplash.com/photo-1638734205377-f21045bf6ebe?auto=format&fit=crop&w=1200&q=80',
    description:
      'A single round brilliant in a four-prong setting, cast in 18k gold. Timeless, understated, worn every day.',
  },
  {
    name: 'Bezel Studs',
    collection: 'The Studs',
    price: 96000,
    imageUrl:
      'https://images.unsplash.com/photo-1687253946687-a3713aa25b2f?auto=format&fit=crop&w=1200&q=80',
    description:
      'A full bezel wraps each stone in a smooth halo of gold, for a lower profile and a more modern line.',
  },
  {
    name: 'Classic Hoops',
    collection: 'The Hoops',
    price: 154000,
    imageUrl:
      'https://images.unsplash.com/photo-1677913842001-3941986ca979?auto=format&fit=crop&w=1200&q=80',
    description:
      'Diamonds set edge to edge along a slim hoop. Substantial in sparkle, light on the ear.',
  },
  {
    name: 'Pavé Hoops',
    collection: 'The Hoops',
    price: 187000,
    imageUrl:
      'https://images.unsplash.com/photo-1605035184674-1ee3fa430b7e?auto=format&fit=crop&w=1200&q=80',
    description:
      'A wider band of pavé-set stones catches the light from every angle for a fuller, brighter hoop.',
  },
  {
    name: 'Classic Tennis Bracelet',
    collection: 'The Tennis',
    price: 342000,
    imageUrl:
      'https://images.unsplash.com/photo-1705575518997-82a71bcc75a2?auto=format&fit=crop&w=1200&q=80',
    description:
      'An unbroken line of matched round brilliants in a secure box-clasp setting. The house classic.',
  },
  {
    name: 'Tennis Necklace',
    collection: 'The Tennis',
    price: 486000,
    imageUrl:
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80',
    description:
      'The tennis bracelet, elongated to a necklace length. Matched stones, continuous fire, worn close to the collarbone.',
  },
]

async function main() {
  await prisma.product.deleteMany()
  await prisma.product.createMany({ data: products })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
