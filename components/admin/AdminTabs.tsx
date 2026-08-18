'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/bespoke', label: 'Bespoke' },
  { href: '/admin/sourcing', label: 'Sourcing' },
] as const

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-ink/10 px-6">
      <div className="mx-auto flex max-w-5xl gap-8">
        {TABS.map((tab) => {
          const active = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 py-3 text-xs uppercase tracking-widest transition-colors ${
                active ? 'border-gold text-ink' : 'border-transparent text-ink/50 hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
