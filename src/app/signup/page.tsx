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
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative bg-[#09090B] text-white">
      {/* Dark Bold Background */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-zinc-600 hover:text-white transition-colors">← Beranda</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
        <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-12 flex flex-col gap-10 rounded-[3rem] shadow-2xl">
          {/* Bold Signup Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center text-3xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
              🌱
            </div>
            <h1 className="text-3xl font-black tracking-tight">Buat Akun Baru</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Mulai Perjalanan Nutrisi</p>
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
