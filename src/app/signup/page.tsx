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
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative bg-[#FFF8F3] dark:bg-[#0F0A05]">
      {/* Dynamic Sunrise Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]" style={{ background: '#E67E22' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[80px]" style={{ background: '#E67E22' }} />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Beranda</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
        <div className="glass-panel p-8 sm:p-10 flex flex-col gap-8 shadow-2xl border-2 border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem]">
          {/* Welcoming Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl bg-gradient-to-br from-[#E67E22] to-[#D35400] text-white rotate-3">
              🌱
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Gabung Sekarang</h1>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">Mulai Hidup Sehatmu</p>
            </div>
          </div>

          {error && (
            <div className="px-5 py-3 rounded-2xl text-xs font-bold text-center border border-red-500/20 bg-red-500/5 text-red-600">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4">
            <div className="space-y-4">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#E67E22] transition-all text-sm font-bold"
                placeholder="Email aktif kamu"
              />
              
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#E67E22] transition-all text-sm font-bold"
                placeholder="Password (min. 6 karakter)"
              />
            </div>

            <button formAction={signup} className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-2">
              Daftar Sekarang
            </button>
          </form>

          <p className="text-center text-xs font-bold opacity-50">
            Sudah ikut perjalanan? <Link href="/login" className="text-[#E67E22] underline underline-offset-4 decoration-2">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
