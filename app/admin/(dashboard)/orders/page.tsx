import { prisma } from '@/lib/prisma'
import { deleteOrder } from '@/actions/admin-records'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Shipping Address</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-ink/10">
                  <td className="py-3 pr-4">{order.id}</td>
                  <td className="py-3 pr-4">{order.name}</td>
                  <td className="py-3 pr-4">{order.email}</td>
                  <td className="py-3 pr-4">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ''}, {order.city},{' '}
                    {order.region} {order.postalCode}, {order.country}
                  </td>
                  <td className="py-3 pr-4">
                    {order.items.map((item) => `${item.productName} ×${item.quantity}`).join(', ')}
                  </td>
                  <td className="py-3 pr-4">${order.total.toLocaleString('en-US')}</td>
                  <td className="py-3 pr-4">{order.createdAt.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <DeleteButton onDelete={deleteOrder.bind(null, order.id)} />
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
