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
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative bg-[#FDFDFD] dark:bg-[#0A0A0A]">
      {/* Subtle Matcha Gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)]" />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Beranda</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[380px] flex flex-col gap-8 relative z-10 animate-fade-in">
        {/* Minimal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm border border-[var(--border)] bg-white dark:bg-zinc-900">
            🍵
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Lanjutkan Langkahmu</h1>
          <p className="text-xs font-medium uppercase tracking-widest opacity-40">Selamat Datang Kembali</p>
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
