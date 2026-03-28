import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Sleek Gradient Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">🍵</span>
          <span className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>SoyProtein</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>by Altaf</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-bold transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Masuk
          </Link>
          <Link href="/redeem" className="btn-primary !w-auto !px-5 !py-2 !text-sm !rounded-xl hidden sm:inline-flex shadow-sm hover:shadow-md transition-all">
            Redeem Code
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-16 px-6 text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-bold tracking-wide uppercase" style={{ borderColor: 'var(--accent-glow)', color: 'var(--accent)', background: 'var(--surface)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
          </span>
          AI-Powered Nutrition Coaching
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mb-6 relative" style={{ color: 'var(--text-primary)' }}>
          Nutrisi Cerdas,{" "}
          <span className="relative inline-block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, #81C784 100%)' }}>
            Hasil Nyata.
          </span>
        </h1>
        <p className="text-lg sm:text-2xl max-w-2xl mb-12 leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
          Raih tubuh ideal dengan program nutrisi personal. Dapatkan akses eksklusif AI Coach dengan menikmati produk kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <Link href="/login" className="btn-primary !rounded-2xl !py-4 text-base shadow-lg">
            Mulai Perjalanan
          </Link>
        </div>
      </main>

      {/* The Products Showcase */}
      <section className="relative z-10 py-16 px-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>Dua Cara, Satu Tujuan</h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>Setiap kemasan dilengkapi dengan QR Code untuk mengaktifkan AI Nutrition Coach Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Susu Kedelai */}
            <div className="glass-panel p-8 sm:p-10 flex flex-col transition-transform hover:-translate-y-1 duration-300">
               <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6" style={{ background: 'rgba(86,196,122,0.15)' }}>🥛</div>
               <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Susu Kedelai</h3>
               <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--accent)' }}>Kesegaran Maksimal & Praktis</p>
               <p className="leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                 Susu kedelai cair segar yang siap minum. Sangat cocok untuk sarapan cepat, penambah energi instan, dan menjaga hidrasi aktif sepanjang hari.
               </p>
               <ul className="space-y-3 mt-auto border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--accent)]">✓</span> Kaya protein murni</li>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--accent)]">✓</span> Rendah kalori & gula</li>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--accent)]">✓</span> Asupan instan kapan saja</li>
               </ul>
            </div>

            {/* Bubuk Kedelai */}
            <div className="glass-panel p-8 sm:p-10 flex flex-col transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-5 rounded-bl-full" />
               <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6" style={{ background: 'rgba(230,126,34,0.15)' }}>🌾</div>
               <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Bubuk Kedelai</h3>
               <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--warning)' }}>Protein Tinggi & Fleksibel</p>
               <p className="leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                 Bubuk kedelai premium dengan konsentrasi protein tinggi. Solusi tahan lama yang sempurna untuk racikan post-workout shake atau campuran masakan sehat.
               </p>
               <ul className="space-y-3 mt-auto border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--warning)]">✓</span> Awet & mudah disimpan</li>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--warning)]">✓</span> Cocok untuk bulking/cutting</li>
                 <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}><span className="text-[var(--warning)]">✓</span> Mudah dicampur bahan lain</li>
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-6 text-center text-sm font-medium border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} SoyProtein by Altaf. All rights reserved.
      </footer>
    </div>
  );
}
