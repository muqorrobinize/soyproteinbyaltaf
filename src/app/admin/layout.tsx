import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Users, QrCode, KeyRound, LayoutDashboard, BookOpen, ArrowLeft, Brain } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && user.email !== 'muqorroben@gmail.com') {
    redirect('/dashboard')
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
      <aside className="w-full md:w-64 glass border-r border-green-200/50 dark:border-green-800/50 flex flex-col z-50">
        <div className="p-6 border-b border-green-200/50 dark:border-green-800/50 flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-green-800 dark:text-green-200 flex items-center gap-2">
            <span>🛡️</span> Admin Panel
          </h2>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-green-900 dark:text-green-100 hover:bg-green-100/50 dark:hover:bg-green-900/50 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-green-200/50 dark:border-green-800/50 flex gap-2 flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-green-800/70 hover:bg-green-100/50 dark:text-green-200/70 dark:hover:bg-green-900/50 transition-colors">
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
