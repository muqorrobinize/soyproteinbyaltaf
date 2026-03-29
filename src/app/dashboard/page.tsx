import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OnboardingForm from '@/components/OnboardingForm'
import ChatInterface from '@/components/ChatInterface'
import ProfileView from '@/components/ProfileView'
import TrackingWidget from '@/components/TrackingWidget'
import ScheduleWidget from '@/components/ScheduleWidget'

// Local Service Client Creator (no extra file needed)
function createServiceClient(url: string, key: string) {
  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default async function DashboardPage({ searchParams }: { searchParams: any }) {
  try {
    const { onboarding } = await searchParams
    const supabase = await createClient()

    // 1. Check Auth (Fast & Primary)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect('/login')
    }

    // 2. Identify Admin Status (Service Role for Bypass)
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      svcKey || ''
    )

    const isGenesisAdmin = user.email === 'muqorrobinize@gmail.com'

    let profile: any = null;
    try {
      // Ensure user row exists with minimal data if missing
      await adminClient.from('users').upsert({
        id: user.id,
        email: user.email,
      }, { onConflict: 'id', ignoreDuplicates: true })

      // SAFE FETCH: Use .limit(1) instead of .single() to prevent 500 errors if results are missing
      const { data: profiles, error: profileError } = await adminClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .limit(1)

      if (profileError) console.error('Safe Fetch Error:', profileError);
      
      profile = profiles && profiles.length > 0 ? profiles[0] : { 
        id: user.id, 
        email: user.email, 
        onboarding_complete: false,
        is_blocked: false,
        role: 'user'
      };
    } catch (err) {
      console.error('Inner Dashboard Logic Crash Avoided:', err);
      profile = { id: user.id, email: user.email, onboarding_complete: false };
    }

    if (profile?.is_blocked) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-black">Akses Diblokir</h1>
          <p className="max-w-md opacity-60">Maaf, akun Anda telah dinonaktifkan oleh administrator.</p>
          <Link href="/auth/signout" className="btn-primary !w-auto !px-8">Keluar</Link>
        </div>
      )
    }

    const subscriptionEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null
    const isAdmin = isGenesisAdmin || profile?.role === 'admin'
    const isSubscribed = isAdmin || (subscriptionEnd && subscriptionEnd > new Date())

    // Onboarding View
    if (!profile?.onboarding_complete && onboarding !== 'skip') {
      return (
        <div className="container-page py-6 sm:py-10 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-[var(--border)]">
            <h1 className="text-3xl font-black mb-2">Halo! 👋</h1>
            <p className="text-sm mb-8 opacity-60">Selesaikan profil untuk mendapatkan rencana nutrisi AI.</p>
            <OnboardingForm userId={user.id} />
          </div>
        </div>
      )
    }

    // Subscription View
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

    const tab = (await searchParams).tab || 'chat'
    const todayStr = new Date().toISOString().split('T')[0]
    let dailyProgress = profile?.daily_progress || []

    // Daily Reset Logic
    if (profile?.last_activity_date !== todayStr) {
      dailyProgress = []
      // We don't need to await this as it will update on next interaction, 
      // but showing it as empty for the UI immediately
    }

    const autoPrompt = onboarding === 'done' && profile?.goal
      ? `Buatkan rencana nutrisi untuk: ${profile.goal}. Berat: ${profile.weight_kg}kg.`
      : undefined

    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)] px-4 py-2 sm:px-6 sm:py-4">
        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl w-full max-w-sm mx-auto mb-6 border border-[var(--border)]">
          <Link 
            href="/dashboard?tab=chat" 
            className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all ${tab === 'chat' ? 'bg-white dark:bg-zinc-700 shadow-sm text-[var(--accent)]' : 'text-zinc-500'}`}
          >
            💬 Chat
          </Link>
          <Link 
            href="/dashboard?tab=profile" 
            className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all ${tab === 'profile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-[var(--accent)]' : 'text-zinc-500'}`}
          >
            👤 Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Main View */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col glass-panel overflow-hidden border border-[var(--border)]">
            {tab === 'profile' ? (
              <ProfileView profile={profile} />
            ) : (
              <ChatInterface autoPrompt={autoPrompt} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:space-y-6 overflow-y-auto pr-1 hidden lg:block custom-scroll">
            <TrackingWidget />
            <ScheduleWidget 
              weightKg={profile?.weight_kg} 
              goal={profile?.goal} 
              streakCount={profile?.streak_count} 
              dailyProgress={dailyProgress}
            />
          </div>
        </div>
      </div>
    )
  } catch (criticalError) {
    console.error('EXTERNAL CRASH DETECTED:', criticalError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/10 rounded-full flex items-center justify-center text-4xl mb-6">🛡️</div>
        <h1 className="text-2xl font-black mb-2">Dashboard Safe Mode</h1>
        <p className="max-w-md text-sm opacity-60 mb-8">
          Kami mendeteksi gangguan teknis. Sistem telah mengaktifkan **Safe Mode** untuk menjaga stabilitas akun Anda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link href="/dashboard" className="btn-primary flex-1">Segarkan Halaman</Link>
          <Link href="/auth/signout" className="btn-secondary !w-auto">Keluar</Link>
        </div>
      </div>
    )
  }
}
