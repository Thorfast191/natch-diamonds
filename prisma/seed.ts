import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: 'Solitaire Studs',
    collection: 'The Studs',
    price: 128000,
    imageUrl:
      'https://images.unsplash.com/photo-1638734205377-f21045bf6ebe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bezel Studs',
    collection: 'The Studs',
    price: 96000,
    imageUrl:
      'https://images.unsplash.com/photo-1687253946687-a3713aa25b2f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classic Hoops',
    collection: 'The Hoops',
    price: 154000,
    imageUrl:
      'https://images.unsplash.com/photo-1677913842001-3941986ca979?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Pavé Hoops',
    collection: 'The Hoops',
    price: 187000,
    imageUrl:
      'https://images.unsplash.com/photo-1605035184674-1ee3fa430b7e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classic Tennis Bracelet',
    collection: 'The Tennis',
    price: 342000,
    imageUrl:
      'https://images.unsplash.com/photo-1705575518997-82a71bcc75a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tennis Necklace',
    collection: 'The Tennis',
    price: 486000,
    imageUrl:
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80',
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
