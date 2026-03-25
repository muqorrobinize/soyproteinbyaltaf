import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <main className="glass-panel w-full max-w-3xl flex flex-col items-center justify-between py-24 px-8 sm:px-16 sm:items-start text-center sm:text-left relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center gap-6 sm:items-start w-full relative z-10">
          <div className="mx-auto sm:mx-0 w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner border border-green-200 dark:border-green-800">
            🌱
          </div>
          <h1 className="max-w-md text-4xl sm:text-5xl font-extrabold tracking-tight text-green-950 dark:text-green-50 leading-tight">
            SoyProtein <span className="text-green-600 dark:text-green-400">by Altaf</span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-green-800/80 dark:text-green-200/80 font-medium">
            Your personal AI-powered nutrition coach. Unlock optimal health and fitness with smart strategies tailored just for you.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 text-base font-bold sm:flex-row mt-12 w-full sm:w-auto relative z-10">
          <Link
            href="/login"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-8 text-white transition-all hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/20 active:scale-95 sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/redeem"
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-green-600/20 dark:border-green-400/20 px-8 transition-all hover:border-transparent hover:bg-green-50 dark:hover:bg-green-900/30 text-green-800 dark:text-green-100 sm:w-auto"
          >
            Redeem Code
          </Link>
        </div>
      </main>
    </div>
  );
}
