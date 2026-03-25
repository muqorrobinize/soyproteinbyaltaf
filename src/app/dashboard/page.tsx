import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile for subscription status and role
  // We handle the case where columns might not exist yet if migration hasn't run
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_end, role, is_blocked')
    .eq('id', user.id)
    .single()

  if (profile?.is_blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Account Blocked</h2>
          <p className="text-green-800 dark:text-green-200">Your account has been suspended. Please contact support.</p>
        </div>
      </div>
    )
  }

  const subscriptionEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null
  const isActive = subscriptionEnd && subscriptionEnd > new Date()
  const isAdmin = profile?.role === 'admin' || user.email === 'muqorroben@gmail.com'

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="glass border-b-0 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-extrabold text-green-700 dark:text-green-400 tracking-tight flex items-center gap-2">
          <span>🌱</span> SoyProtein Coach
        </h1>
        <div className="flex gap-4 items-center">
          {isAdmin && (
            <Link href="/admin" className="text-xs font-bold px-3 py-1.5 bg-green-900 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm">
              Admin Panel
            </Link>
          )}
          <ThemeToggle />
          <span className="text-sm font-bold text-green-800/70 dark:text-green-200/70 hidden sm:block">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors">Sign Out</button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 relative z-10">
        {/* Subscription Status Widget */}
        <section className={`glass-panel p-6 ${isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{isActive ? '✨' : '⚠️'}</span>
                <h2 className={`text-lg font-bold ${isActive ? 'text-green-800 dark:text-green-300' : 'text-orange-800 dark:text-orange-400'}`}>
                  {isActive ? 'Active Subscription' : 'No Active Subscription'}
                </h2>
              </div>
              <p className={`text-sm font-medium ${isActive ? 'text-green-700/80 dark:text-green-200/80' : 'text-orange-700/80 dark:text-orange-300/80'}`}>
                {isActive 
                  ? `Your AI Coach access is active until ${subscriptionEnd.toLocaleDateString(undefined, { dateStyle: 'long' })}` 
                  : 'Redeem a code from your physical product to activate your AI Coach.'}
              </p>
            </div>
            
            <Link 
              href="/redeem" 
              className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isActive ? 'bg-white/50 dark:bg-black/30 text-green-800 dark:text-green-200 hover:bg-white/80 dark:hover:bg-black/50 border border-green-200 dark:border-green-800' : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg active:scale-95 border-none'}`}
            >
              {isActive ? 'Extend Access' : 'Redeem Code'}
            </Link>
          </div>
        </section>

        {/* AI Coach Area */}
        <section className="flex-1 glass-panel flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-green-200/50 dark:border-green-800/50 bg-white/30 dark:bg-black/20">
            <h3 className="font-bold text-green-950 dark:text-green-50 flex items-center gap-2 text-lg">
              <span className="text-2xl bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 w-10 h-10 flex items-center justify-center rounded-full shadow-inner">🤖</span> 
              Your AI Nutrition Coach
            </h3>
          </div>
          
          {isActive ? (
            <ChatInterface />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
               <div className="w-20 h-20 bg-green-100/50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner border border-green-200/50 dark:border-green-800/50">🔒</div>
               <h3 className="text-2xl font-extrabold text-green-900 dark:text-green-100">Coach Locked</h3>
               <p className="text-green-800/70 dark:text-green-200/70 font-medium max-w-sm mt-3 leading-relaxed">You need an active subscription to chat with the AI Coach. Scan your product QR code to unlock full features.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
