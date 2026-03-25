import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
  const { count: qrCount } = await supabaseAdmin.from('qr_codes').select('*', { count: 'exact', head: true })
  const { count: keysCount } = await supabaseAdmin.from('api_keys').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-green-950 dark:text-green-50">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Total Users</h3>
          <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">{usersCount || 0}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Total QR Codes</h3>
          <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">{qrCount || 0}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">API Keys</h3>
          <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">{keysCount || 0}</p>
        </div>
      </div>
    </div>
  )
}
