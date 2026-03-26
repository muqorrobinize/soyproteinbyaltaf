import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import RedeemForm from './RedeemForm'

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; success?: string }>
}) {
  const { code, error, success } = await searchParams

  // Check if user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Preserve code in login redirect
    const loginUrl = code ? `/login?message=Login+terlebih+dahulu+untuk+redeem` : '/login'
    redirect(loginUrl)
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center flex-col px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-[70px]" style={{ background: 'var(--accent)' }} />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>← Dashboard</Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm glass-panel p-7 flex flex-col gap-5 relative z-10 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md" style={{ background: 'var(--accent)', color: '#fff' }}>
            🎁
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Redeem Code</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Scan QR pada kemasan atau masukkan kode manual</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(192,57,43,0.10)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(77,124,95,0.12)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
            ✅ {success}
          </div>
        )}

        <RedeemForm initialCode={code} />

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Kode ditemukan di kemasan produk SoyProtein by Altaf
        </p>
      </div>
    </div>
  )
}
