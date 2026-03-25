import { login, signup } from './actions'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center flex-col px-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 glass-panel flex flex-col gap-6 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner border border-green-200 dark:border-green-800">
            👋
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-green-950 dark:text-green-50">Welcome Back</h1>
          <p className="text-green-800/70 dark:text-green-200/70 mt-2 font-medium">Sign in or create an account to access your AI Coach</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-sm text-center font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold text-green-900 dark:text-green-100">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="p-4 bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 text-green-950 dark:text-green-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none backdrop-blur-sm placeholder-green-800/40 dark:placeholder-green-200/40 font-medium"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-green-900 dark:text-green-100">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="p-4 bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 text-green-950 dark:text-green-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none backdrop-blur-sm placeholder-green-800/40 dark:placeholder-green-200/40 font-medium"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full py-4 bg-green-600 text-white font-extrabold rounded-xl hover:bg-green-500 active:scale-[0.98] transition-all shadow-md shadow-green-600/20"
            >
              Sign In
            </button>
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute border-t border-green-200 dark:border-green-800/50 w-full"></div>
              <span className="bg-transparent backdrop-blur-md px-4 text-xs font-bold text-green-800/50 dark:text-green-200/50 relative">OR</span>
            </div>
            <button
              formAction={signup}
              className="w-full py-4 bg-white/40 dark:bg-black/40 text-green-900 dark:text-green-100 font-extrabold rounded-xl border border-green-200 dark:border-green-800/50 hover:bg-white/60 dark:hover:bg-black/60 active:scale-[0.98] transition-all backdrop-blur-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
