export function Footer() {
  return (
    <footer className="border-t border-ink/10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="h-px w-full bg-gold/40" />
        <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs uppercase tracking-widest text-ink/40">
          <p>Natch Diamonds</p>
          <p>&copy; {new Date().getFullYear()} Natch Diamonds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
