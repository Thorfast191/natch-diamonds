import type { ReactNode } from 'react'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { logout } from '@/actions/admin-auth'

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-ink/10 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-display text-xl tracking-[0.15em] text-ink">NATCH ADMIN</h1>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-ink"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <AdminTabs />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
