import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import OnboardingForm from '@/components/OnboardingForm'
import TrackingWidget from '@/components/TrackingWidget'
import ScheduleWidget from '@/components/ScheduleWidget'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ClaimTrialButton } from '@/components/ClaimTrialButton'

const GENESIS_EMAIL = 'muqorroben@gmail.com'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string; success?: string }>
}) {
  const { onboarding } = await searchParams
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    // Middleware should have redirected — this is a safety fallback
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    )
  }

  const isGenesisAdmin = user.email?.toLowerCase() === GENESIS_EMAIL.toLowerCase()

  // Admin service client for upsert/reads
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ensure user row always exists (handles genesis admin + any race condition)
  await adminClient.from('users').upsert({
    id: user.id,
    email: user.email,
  }, { onConflict: 'id', ignoreDuplicates: true })

  // Fetch full profile
  const { data: profile } = await adminClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.is_blocked) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--danger)' }}>Akun Ditangguhkan</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Hubungi support untuk informasi lebih lanjut.</p>
        </div>
      </div>
    )
  }

  // Show onboarding if not completed
  if (profile && !profile.onboarding_complete) {
    return <OnboardingForm userId={user.id} email={user.email || ''} />
  }

  const subscriptionEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null
  // Genesis admin and role=admin always have active access
  const isAdmin = isGenesisAdmin || profile?.role === 'admin'
  const isActive = isAdmin || (subscriptionEnd !== null && subscriptionEnd > new Date())
  const daysLeft = subscriptionEnd ? Math.ceil((subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  // Tracking data for last 7 days
  const today = new Date()
  const recentDays: { date: string; logged: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    recentDays.push({ date: d.toISOString().split('T')[0], logged: false })
  }

  if (isActive) {
    const { data: trackingEntries } = await supabase
      .from('tracking')
      .select('tracked_date')
      .eq('user_id', user.id)
      .gte('tracked_date', recentDays[0].date)
    if (trackingEntries) {
      const trackedDates = new Set(trackingEntries.map(t => t.tracked_date))
      recentDays.forEach(d => { if (trackedDates.has(d.date)) d.logged = true })
    }
  }

  const todayStr = today.toISOString().split('T')[0]
  const alreadyTrackedToday = recentDays.find(d => d.date === todayStr)?.logged || false

  // Auto-conversation starter after onboarding
  const autoPrompt = onboarding === 'done' && profile?.goal
    ? `Halo! Saya baru saja mengisi profil. Berat: ${profile.weight_kg}kg, Tinggi: ${profile.height_cm}cm, Usia: ${profile.age} tahun, Tujuan: ${profile.goal}, Aktivitas: ${profile.activity_level}. Tolong buatkan rencana nutrisi dan jadwal harian yang sudah dipersonalisasi untuk saya, termasuk dosis soy protein yang tepat.`
    : undefined

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">🍵</span>
          <span className="font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>SoyProtein</span>
          {isAdmin && (
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>Admin</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAdmin && (
            <Link href="/admin" className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: 'var(--accent)' }}>
              Panel Admin
            </Link>
          )}
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.15)' }}>
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
        {/* Welcome bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {profile?.display_name ? `Halo, ${profile.display_name}! 👋` : 'Dashboard'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          {/* Subscription status pill */}
          {isAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(86,196,122,0.15)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
              ♾️ Unlimited Access
            </span>
          ) : (
            <Link href="/redeem" className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${isActive ? '' : 'animate-pulse'}`}
              style={isActive
                ? { background: 'rgba(77,124,95,0.12)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }
                : { background: 'var(--warning)', color: '#fff' }
              }>
              <span>{isActive ? '✨' : '⚠️'}</span>
              <span>{isActive && daysLeft !== null ? `${daysLeft} hari tersisa` : isActive ? 'Aktif' : 'Redeem Code'}</span>
            </Link>
          )}
        </div>

        {/* Tracking Widget */}
        {isActive && (
          <TrackingWidget
            alreadyTrackedToday={alreadyTrackedToday}
            streakCount={profile?.streak_count || 0}
            recentDays={recentDays}
          />
        )}

        {isActive ? (
          <div className="flex-1 grid lg:grid-cols-5 gap-4">
            {/* Schedule */}
            <div className="lg:col-span-2">
              <ScheduleWidget
                weightKg={profile?.weight_kg}
                goal={profile?.goal}
                streakCount={profile?.streak_count}
              />
            </div>

            {/* AI Chat */}
            <div className="lg:col-span-3 glass-panel flex flex-col" style={{ minHeight: '420px' }}>
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>🤖</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Nutrition Coach</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>evidence-based · personalized</p>
                </div>
                {onboarding === 'done' && (
                  <span className="ml-auto text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(86,196,122,0.15)', color: 'var(--accent)' }}>
                    🎉 Plan sedang dibuat...
                  </span>
                )}
              </div>
              <ChatInterface autoPrompt={autoPrompt} />
            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel flex flex-col items-center justify-center py-16 text-center px-6 transition-all animate-fade-in">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-lg bg-surface-hover border-[3px]" style={{ borderColor: 'var(--border-strong)' }}>🔒</div>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>Akses Coach Terkunci</h2>
            <p className="text-sm mb-10 max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              AI Nutrition Coach saat ini tidak aktif. Anda memerlukan langganan aktif untuk berkonsultasi mengenai diet dan jadwal harian.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
              <Link href="/redeem" className="btn-primary !w-auto !px-10 !rounded-2xl shadow-lg">
                🎁 Redeem Code Produk
              </Link>
              {!profile?.trial_claimed && (
                <ClaimTrialButton userId={user.id} />
              )}
            </div>

            <div className="pt-8 border-t w-full max-w-xs" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest leading-loose" style={{ color: 'var(--text-muted)' }}>
                Info: Scan QR pada kemasan Susu atau Bubuk SoyProtein untuk akses premium selamanya.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
