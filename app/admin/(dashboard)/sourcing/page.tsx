import { prisma } from '@/lib/prisma'
import { deleteSourcingInquiry } from '@/actions/admin-records'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminSourcingPage() {
  const inquiries = await prisma.sourcingInquiry.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Sourcing Inquiries</h2>
      {inquiries.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">No sourcing inquiries yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Buyer Type</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Interest</th>
                <th className="py-2 pr-4">Details</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-ink/10">
                  <td className="py-3 pr-4">{inquiry.name}</td>
                  <td className="py-3 pr-4">{inquiry.email}</td>
                  <td className="py-3 pr-4">{inquiry.buyerType}</td>
                  <td className="py-3 pr-4">{inquiry.companyName ?? '—'}</td>
                  <td className="py-3 pr-4">{inquiry.interest}</td>
                  <td className="py-3 pr-4">{inquiry.details}</td>
                  <td className="py-3 pr-4">{inquiry.createdAt.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <DeleteButton onDelete={deleteSourcingInquiry.bind(null, inquiry.id)} />
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
