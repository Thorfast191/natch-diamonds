'use client'

import { useState } from 'react'

const LINKS = [
  { href: '#collection', label: 'Collection' },
  { href: '#bespoke', label: 'Bespoke' },
  { href: '#sourcing', label: 'Sourcing' },
] as const

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="font-display text-lg tracking-[0.2em] text-ink">
          NATCH DIAMONDS
        </a>
        <nav className="hidden gap-8 sm:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <span
            className={`h-px w-5 bg-ink transition-transform ${open ? 'translate-y-[3.5px] rotate-45' : ''}`}
          />
          <span
            className={`h-px w-5 bg-ink transition-transform ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`}
          />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-ink/10 px-6 py-4 sm:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
