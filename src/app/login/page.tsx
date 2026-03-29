import { login } from './actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative bg-white text-zinc-900">
      {/* Light Clean Background */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">← Beranda</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[360px] flex flex-col gap-10 relative z-10 animate-fade-in py-12">
        {/* Minimalist Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl bg-zinc-50 border border-zinc-100 shadow-sm">
            🍵
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Lanjutkan Sehatmu</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Masuk ke Akun Anda</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-xs font-bold text-center border border-[rgba(192,57,43,0.2)] bg-[rgba(192,57,43,0.05)] text-[var(--danger)]">
            {error}
          </div>
        )}

        {message && (
          <div className="px-4 py-3 rounded-xl text-xs font-bold text-center border border-[var(--border)] bg-[rgba(77,124,95,0.05)] text-[var(--accent)]">
            {message}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div className="space-y-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] py-3 px-1 outline-none transition-all text-sm font-medium"
              placeholder="Email"
            />
          </div>
          
          <div className="space-y-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] py-3 px-1 outline-none transition-all text-sm font-medium"
              placeholder="Password"
            />
          </div>

          <button formAction={login} className="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest bg-[var(--accent)] text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
            Masuk
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs font-bold opacity-50">
            Belum punya akun? <Link href="/signup" className="text-[var(--accent)] underline underline-offset-4 decoration-2">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
