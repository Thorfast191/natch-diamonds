import { prisma } from '@/lib/prisma'
import { deleteBespokeInquiry } from '@/actions/admin-records'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminBespokePage() {
  const inquiries = await prisma.bespokeInquiry.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Bespoke Inquiries</h2>
      {inquiries.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">No bespoke inquiries yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
                <th className="py-2 pr-4">Photo</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-ink/10">
                  <td className="py-3 pr-4">
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
                  <td className="py-3 pr-4">{inquiry.name}</td>
                  <td className="py-3 pr-4">{inquiry.email}</td>
                  <td className="py-3 pr-4">{inquiry.description}</td>
                  <td className="py-3 pr-4">{inquiry.createdAt.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <DeleteButton onDelete={deleteBespokeInquiry.bind(null, inquiry.id)} />
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
