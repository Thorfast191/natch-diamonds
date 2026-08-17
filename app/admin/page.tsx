import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [bespokeInquiries, sourcingInquiries] = await Promise.all([
    prisma.bespokeInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.sourcingInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Admin</h1>

      <h2 className="mt-10 text-xl font-semibold">Bespoke Inquiries</h2>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Photo</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {bespokeInquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b">
                <td className="py-2 pr-4">
                  {inquiry.inspirationImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inquiry.inspirationImageUrl}
                      alt=""
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2 pr-4">{inquiry.name}</td>
                <td className="py-2 pr-4">{inquiry.email}</td>
                <td className="py-2 pr-4">{inquiry.description}</td>
                <td className="py-2 pr-4">{inquiry.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Sourcing Inquiries</h2>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Buyer Type</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Interest</th>
              <th className="py-2 pr-4">Details</th>
              <th className="py-2 pr-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {sourcingInquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b">
                <td className="py-2 pr-4">{inquiry.name}</td>
                <td className="py-2 pr-4">{inquiry.email}</td>
                <td className="py-2 pr-4">{inquiry.buyerType}</td>
                <td className="py-2 pr-4">{inquiry.companyName ?? '—'}</td>
                <td className="py-2 pr-4">{inquiry.interest}</td>
                <td className="py-2 pr-4">{inquiry.details}</td>
                <td className="py-2 pr-4">{inquiry.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
