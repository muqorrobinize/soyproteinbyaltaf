import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import OnboardingForm from '@/components/OnboardingForm'
import TrackingWidget from '@/components/TrackingWidget'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.is_blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Account Blocked</h2>
          <p className="text-green-800 dark:text-green-200">Akun Anda telah ditangguhkan. Silakan hubungi support.</p>
        </div>
      </div>
    )
  }

  if (profile && !profile.onboarding_complete) {
    return <OnboardingForm userId={user.id} email={user.email || ''} />
  }

  const subscriptionEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null
  const isActive = subscriptionEnd && subscriptionEnd > new Date()
  const isAdmin = profile?.role === 'admin' || user.email === 'muqorroben@gmail.com'
  const daysLeft = subscriptionEnd ? Math.ceil((subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  // Get tracking data for last 7 days
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="glass border-b-0 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg sm:text-xl font-extrabold text-green-700 dark:text-green-400 tracking-tight flex items-center gap-2">
          <span>🌱</span> <span className="hidden sm:inline">SoyProtein Coach</span><span className="sm:hidden">SP Coach</span>
        </h1>
        <div className="flex gap-2 sm:gap-4 items-center">
          {isAdmin && (
            <Link href="/admin" className="text-xs font-bold px-2 sm:px-3 py-1.5 bg-green-900 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm">
              Admin
            </Link>
          )}
          <ThemeToggle />
          <span className="text-xs sm:text-sm font-bold text-green-800/70 dark:text-green-200/70 hidden md:block">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors">Sign Out</button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative z-10">
        {/* Welcome */}
        {profile?.display_name && (
          <p className="text-green-800/70 dark:text-green-200/70 font-medium">
            Halo, <strong className="text-green-900 dark:text-green-100">{profile.display_name}</strong>! 👋
          </p>
        )}

        {/* Subscription Status */}
        <section className={`glass-panel p-4 sm:p-5 ${isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{isActive ? '✨' : '⚠️'}</span>
                <h2 className={`text-sm sm:text-base font-bold ${isActive ? 'text-green-800 dark:text-green-300' : 'text-orange-800 dark:text-orange-400'}`}>
                  {isActive ? `Active — ${daysLeft} hari tersisa` : 'Subscription Tidak Aktif'}
                </h2>
              </div>
              <p className={`text-xs font-medium ${isActive ? 'text-green-700/80 dark:text-green-200/80' : 'text-orange-700/80 dark:text-orange-300/80'}`}>
                {isActive 
                  ? `Sampai ${subscriptionEnd.toLocaleDateString('id-ID', { dateStyle: 'long' })}` 
                  : 'Redeem kode dari produk untuk mengaktifkan AI Coach'}
              </p>
            </div>
            <Link href="/redeem" className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all shadow-md text-sm ${isActive ? 'bg-white/50 dark:bg-black/30 text-green-800 dark:text-green-200 hover:bg-white/80 border border-green-200 dark:border-green-800' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'}`}>
              {isActive ? 'Perpanjang' : 'Redeem Code'}
            </Link>
          </div>
        </section>

        {/* Daily Tracking (only if active subscription) */}
        {isActive && (
          <TrackingWidget 
            alreadyTrackedToday={alreadyTrackedToday} 
            streakCount={profile?.streak_count || 0}
            recentDays={recentDays}
          />
        )}

        {/* AI Coach */}
        <section className="flex-1 glass-panel flex flex-col min-h-[350px] sm:min-h-[450px]">
          <div className="p-3 sm:p-4 border-b border-green-200/50 dark:border-green-800/50 bg-white/30 dark:bg-black/20">
            <h3 className="font-bold text-green-950 dark:text-green-50 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-xl bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 w-8 h-8 flex items-center justify-center rounded-full shadow-inner">🤖</span> 
              AI Nutrition Coach
              <span className="ml-auto text-xs font-normal text-green-800/50 dark:text-green-200/50">evidence-based</span>
            </h3>
          </div>
          
          {isActive ? (
            <ChatInterface />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
               <div className="w-16 h-16 bg-green-100/50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner border border-green-200/50 dark:border-green-800/50">🔒</div>
               <h3 className="text-lg sm:text-xl font-extrabold text-green-900 dark:text-green-100">Coach Terkunci</h3>
               <p className="text-green-800/70 dark:text-green-200/70 font-medium max-w-sm mt-2 text-sm">Scan QR code pada kemasan produk untuk membuka AI Coach.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
