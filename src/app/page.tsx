import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--accent)] opacity-10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[var(--accent)] opacity-8 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-400 opacity-5 blur-[60px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-5 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍵</span>
          <span className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>SoyProtein</span>
          <span className="text-sm font-medium opacity-60 hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>by Altaf</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="btn-primary !w-auto !px-5 !py-2.5 !text-sm">
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-16 sm:py-24 text-center animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-sm font-bold" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--surface)' }}>
          <span>🤖</span> AI-Powered Nutrition Coaching
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
          Nutrisi Cerdas,{" "}
          <span style={{ color: 'var(--accent)' }}>Hasil Nyata</span>
        </h1>
        <p className="text-base sm:text-xl max-w-lg mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Platform coaching nutrisi berbasis AI yang terintegrasi dengan produk kedelai. Scan QR, redeem, dan mulai perjalanan menuju tubuh ideal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md">
          <Link href="/login" className="btn-primary !rounded-2xl !py-4 text-base">
            🚀 Mulai Sekarang
          </Link>
          <Link href="/redeem" className="btn-secondary !rounded-2xl !py-4 text-base">
            🎁 Redeem Code
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {['🧬 Evidence-based', '🔒 Data aman', '📱 Mobile-first', '🎯 Adaptive AI'].map(item => (
            <span key={item} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{item}</span>
          ))}
        </div>
      </main>

      {/* Features strip */}
      <div className="relative z-10 pb-12 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📦', title: 'Scan QR', desc: 'Di kemasan produk' },
            { icon: '🎯', title: 'AI Coach', desc: 'Personal & adaptif' },
            { icon: '📊', title: 'Tracking', desc: '1 klik per hari' },
            { icon: '🔄', title: 'Repeat', desc: 'Beli lagi, extend' },
          ].map(f => (
            <div key={f.title} className="glass-panel p-4 text-center animate-fade-in">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
