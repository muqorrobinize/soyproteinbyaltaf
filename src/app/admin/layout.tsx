import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Users, QrCode, KeyRound, LayoutDashboard, BookOpen, ArrowLeft, Brain } from 'lucide-react'

const GENESIS_EMAIL = 'muqorroben@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Middleware already redirects unauthenticated users — safety fallback only
  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    )
  }

  // Use service role to bypass RLS for role check
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: profile } = await adminClient.from('users').select('role').eq('id', user.id).single()
  
  const isAdmin = profile?.role === 'admin' || user.email?.toLowerCase() === GENESIS_EMAIL.toLowerCase()
  
  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--danger)' }}>Akses Ditolak</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Kamu tidak memiliki akses ke panel admin.</p>
          <Link href="/dashboard" className="btn-primary !w-auto !px-6 !rounded-xl inline-block">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'QR Codes', href: '/admin/qr', icon: QrCode },
    { name: 'API Keys', href: '/admin/keys', icon: KeyRound },
    { name: 'Knowledge Base', href: '/admin/knowledge', icon: Brain },
    { name: 'Setup Guide', href: '/admin/guide', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass flex flex-col z-50" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>🛡️</span> Admin Panel
          </h2>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
