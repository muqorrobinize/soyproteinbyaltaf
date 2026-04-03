import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OnboardingForm from '@/components/OnboardingForm'
import ChatInterface from '@/components/ChatInterface'
import ProfileView from '@/components/ProfileView'
import TrackingWidget from '@/components/TrackingWidget'
import ScheduleWidget from '@/components/ScheduleWidget'

// Local Service Client Creator
function createServiceClient(url: string, key: string) {
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function DashboardPage({ searchParams }: { searchParams: any }) {
  try {
    const { onboarding } = await searchParams
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    // 2. Identify Admin Status & Profile
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, svcKey || '')

    const { data: profiles } = await adminClient.from('users').select('*').eq('id', user.id).limit(1)
    const profile = profiles?.[0] || { id: user.id, email: user.email, onboarding_complete: false }

    if (profile?.is_blocked) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center text-zinc-900">
          <div className="text-6xl text-red-500">🔒</div>
          <h1 className="text-2xl font-black">Akses Diblokir</h1>
          <Link href="/auth/signout" className="btn-primary !w-auto !px-8">Keluar</Link>
        </div>
      )
    }

    const isAdmin = user.email === 'muqorrobinize@gmail.com' || profile?.role === 'admin'
    const isSubscribed = isAdmin || (profile.subscription_end && new Date(profile.subscription_end) > new Date())

    // Onboarding Handling
    if (!profile?.onboarding_complete && onboarding !== 'skip') {
      return (
        <div className="container-page py-6 sm:py-10 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-zinc-100 dark:border-zinc-800">
            <h1 className="text-3xl font-black mb-2 text-zinc-900 dark:text-white">Halo! 👋</h1>
            <p className="text-sm mb-8 opacity-60 text-zinc-600 dark:text-zinc-400">Selesaikan profil untuk mendapatkan rencana nutrisi AI.</p>
            <OnboardingForm userId={user.id} email={user.email || ''} />
          </div>
        </div>
      )
    }

    // Subscription Handling
    if (!isSubscribed) {
      return (
        <div className="container-page py-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="text-4xl mb-6">🎟️</div>
          <h1 className="text-3xl font-black mb-4">Akses Terbatas</h1>
          <p className="mb-8 opacity-60">Pindai kode QR di kemasan Soy Protein untuk mulai.</p>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <Link href="/redeem" className="btn-primary flex-1">Scan Kode</Link>
            <Link href="/auth/signout" className="btn-secondary !w-auto">Keluar</Link>
          </div>
        </div>
      )
    }

    // --- TRACKING DATA LOGIC ---
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: rawTracking } = await adminClient
      .from('tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('tracked_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('tracked_date', { ascending: true })

    const alreadyTrackedToday = rawTracking?.some(t => t.tracked_date === today) || false
    
    // Format 7-day history for widget
    const recentDays = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      recentDays.push({
        date: dateStr,
        logged: rawTracking?.some(t => t.tracked_date === dateStr) || false
      })
    }

    const tab = (await searchParams).tab || 'chat'
    const todayStr = new Date().toISOString().split('T')[0]
    let dailyProgress = profile?.daily_progress || []

    if (profile?.last_activity_date !== todayStr) {
      dailyProgress = []
    }

    const autoPrompt = onboarding === 'done' && profile?.goal
      ? `Buatkan rencana nutrisi untuk: ${profile.goal}. Berat: ${profile.weight_kg}kg.`
      : undefined

    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] px-4 py-2 sm:px-6 sm:py-4">
        {/* Top bar with admin link + signout */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍵</span>
            <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>SoyProtein</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all" style={{ background: 'var(--surface-hover)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                ⚙️ Admin
              </Link>
            )}
            <Link href="/auth/signout" className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Keluar
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
          <Link href="/dashboard?tab=chat" className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all ${tab === 'chat' ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600' : 'text-zinc-500'}`}>💬 Chat</Link>
          <Link href="/dashboard?tab=progress" className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all ${tab === 'progress' ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600' : 'text-zinc-500'}`}>📊 Progress</Link>
          <Link href="/dashboard?tab=profile" className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all ${tab === 'profile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600' : 'text-zinc-500'}`}>👤 Profile</Link>
        </div>

        {tab === 'progress' ? (
          /* Mobile-friendly progress view */
          <div className="flex-1 space-y-4 overflow-y-auto custom-scroll pb-4">
            <TrackingWidget 
              alreadyTrackedToday={alreadyTrackedToday} 
              streakCount={profile?.streak_count || 0}
              recentDays={recentDays}
            />
            <ScheduleWidget 
              weightKg={profile?.weight_kg} 
              goal={profile?.goal} 
              streakCount={profile?.streak_count} 
              dailyProgress={dailyProgress}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Main Content */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col glass-panel overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {tab === 'profile' ? <ProfileView profile={profile} /> : <ChatInterface autoPrompt={autoPrompt} />}
            </div>

            {/* Sidebar — desktop only */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:space-y-6 overflow-y-auto pr-1 hidden lg:block custom-scroll">
              <TrackingWidget 
                alreadyTrackedToday={alreadyTrackedToday} 
                streakCount={profile?.streak_count || 0}
                recentDays={recentDays}
              />
              <ScheduleWidget 
                weightKg={profile?.weight_kg} 
                goal={profile?.goal} 
                streakCount={profile?.streak_count} 
                dailyProgress={dailyProgress}
              />
            </div>
          </div>
        )}
      </div>
    )
  } catch (criticalError) {
    console.error('EXTERNAL CRASH DETECTED:', criticalError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center text-zinc-900 dark:text-white">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/10 rounded-full flex items-center justify-center text-4xl mb-6 font-bold">🛡️</div>
        <h1 className="text-2xl font-black mb-2">Dashboard Safe Mode</h1>
        <p className="max-w-md text-sm opacity-60 mb-8">Teknis sistem sedang bermasalah. Akun Anda aman dalam Safe Mode.</p>
        <Link href="/dashboard" className="btn-primary">Segarkan Halaman</Link>
      </div>
    )
  }
}
