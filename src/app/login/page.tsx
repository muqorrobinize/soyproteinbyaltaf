import { login, signup } from './actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-10 blur-[80px]" style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-8 blur-[60px]" style={{ background: 'var(--accent)' }} />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>← Home</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm glass-panel p-7 flex flex-col gap-5 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md" style={{ background: 'var(--accent)', color: '#fff' }}>
            🍵
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>SoyProtein</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Masuk atau buat akun baru</p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(192,57,43,0.10)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
            {error}
          </div>
        )}

        {/* Success / info */}
        {message && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(77,124,95,0.12)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
            {message}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-field"
              placeholder="kamu@email.com"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="Min. 6 karakter"
            />
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button formAction={login} className="btn-primary">
              Masuk
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>ATAU</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            <button formAction={signup} className="btn-secondary">
              Buat Akun Baru
            </button>
          </div>
        </form>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Dengan masuk, kamu menyetujui penggunaan platform untuk keperluan nutrisi pribadi.
        </p>
      </div>
    </div>
  )
}
