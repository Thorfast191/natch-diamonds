import { login } from '@/actions/admin-auth'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-2xl">Admin Login</h1>
      <form action={login} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm text-ink/70">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 focus:border-gold focus:outline-none"
          />
        </div>
        {searchParams.error && <p className="text-sm text-red-700">Incorrect password.</p>}
        <button
          type="submit"
          className="bg-charcoal px-6 py-2 text-sm uppercase tracking-widest text-white"
        >
          Sign In
        </button>
      </form>
    </main>
  )
}
