import { signup } from '../login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative">
      {/* Background with different accent for Signup */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-10 blur-[80px]" style={{ background: '#E67E22' }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-8 blur-[60px]" style={{ background: '#E67E22' }} />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>← Home</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm glass-panel p-7 flex flex-col gap-5 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md bg-gradient-to-br from-[#E67E22] to-[#D35400] text-white">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Join SoyProtein</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Mulai langkah awal hidup sehat hari ini</p>
        </div>

        {/* ... existing error/message handling ... */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(192,57,43,0.10)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
            {error}
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
              autoComplete="new-password"
              className="input-field"
              placeholder="Min. 6 karakter"
            />
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button formAction={signup} className="btn-primary !bg-[#E67E22] hover:!bg-[#D35400] border-none">
              Daftar Sekarang
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Sudah punya akun? {' '}
              <Link href="/login" className="font-bold underline" style={{ color: 'var(--accent)' }}>
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>

        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Dengan mendaftar, kamu menyetujui penggunaan platform untuk keperluan nutrisi pribadi.
        </p>
      </div>
    </div>
  )
}
