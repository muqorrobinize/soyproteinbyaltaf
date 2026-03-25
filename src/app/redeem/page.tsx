import { redeemCode } from './actions'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string, error?: string }>
}) {
  const { code, error } = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center flex-col px-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 glass-panel flex flex-col gap-6 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner border border-green-200 dark:border-green-800">
            🎁
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-green-950 dark:text-green-50">Redeem Code</h1>
          <p className="text-green-800/70 dark:text-green-200/70 mt-2 font-medium">Enter the unique code from your SoyProtein product packaging to activate your AI Coach access.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-sm text-center font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-bold text-green-900 dark:text-green-100">Subscription Code</label>
            <input
              id="code"
              name="code"
              type="text"
              required
              defaultValue={code || ''}
              className="p-4 text-center font-mono text-2xl font-extrabold tracking-[0.2em] bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 text-green-950 dark:text-green-50 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none uppercase backdrop-blur-sm placeholder-green-800/30 dark:placeholder-green-200/30"
              placeholder="XXXXXXXX"
            />
          </div>

          <div className="flex flex-col mt-4">
            <button
              formAction={redeemCode}
              className="w-full py-4 bg-green-600 text-white font-extrabold rounded-xl hover:bg-green-500 active:scale-[0.98] transition-all shadow-md shadow-green-600/20"
            >
              Activate Code
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
