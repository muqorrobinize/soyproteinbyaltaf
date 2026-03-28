import { createClient as createServiceClient } from '@supabase/supabase-js'
import { toggleUserBlock, makeUserAdmin, adjustSubscription } from '../actions'

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: users } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Manage Users</h2>
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-100/50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Email</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Role</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Status</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Subscription</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => {
                const subEnd = user.subscription_end ? new Date(user.subscription_end) : null
                const isActive = subEnd && subEnd > new Date()
                const daysLeft = subEnd ? Math.ceil((subEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

                return (
                  <tr key={user.id} className="border-b border-green-100 dark:border-green-900/50 hover:bg-white/40 dark:hover:bg-black/20">
                    <td className="p-4 text-sm text-[var(--text-primary)]">
                      <div className="font-bold mb-1">{user.email || 'N/A'}</div>
                      <details className="text-xs group cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                        <summary className="font-bold hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 select-none">
                          <span className="group-open:rotate-90 transition-transform">▶</span> View Info
                        </summary>
                        <div className="mt-2 p-3 rounded-xl border space-y-1.5" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Name:</strong> {user.display_name || '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Weight:</strong> {user.weight_kg ? `${user.weight_kg} kg` : '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Height:</strong> {user.height_cm ? `${user.height_cm} cm` : '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Age:</strong> {user.age || '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Gender:</strong> {user.gender || '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Goal:</strong> {user.goal || '-'}</p>
                          <p><strong style={{ color: 'var(--text-primary)' }}>Activity:</strong> {user.activity_level || '-'}</p>
                          {user.dietary_notes && <p><strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {user.dietary_notes}</p>}
                        </div>
                      </details>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${user.is_blocked ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {isActive ? `${daysLeft}d left` : 'No subscription'}
                        </span>
                        {subEnd && (
                          <span className="text-xs text-green-800/50 dark:text-green-200/50">
                            until {subEnd.toLocaleDateString()}
                          </span>
                        )}
                        <div className="flex gap-1 mt-1">
                          <form action={adjustSubscription.bind(null, user.id, 7)} className="inline">
                            <button className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-bold">+7d</button>
                          </form>
                          <form action={adjustSubscription.bind(null, user.id, 30)} className="inline">
                            <button className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-bold">+30d</button>
                          </form>
                          <form action={adjustSubscription.bind(null, user.id, 90)} className="inline">
                            <button className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-bold">+90d</button>
                          </form>
                          <form action={adjustSubscription.bind(null, user.id, -30)} className="inline">
                            <button className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded hover:bg-orange-400 transition-colors font-bold">-30d</button>
                          </form>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right space-y-1">
                      {user.role !== 'admin' && (
                        <form action={makeUserAdmin.bind(null, user.id)} className="inline">
                          <button className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors shadow-sm font-bold">Make Admin</button>
                        </form>
                      )}
                      <br />
                      <form action={toggleUserBlock.bind(null, user.id, !user.is_blocked)} className="inline">
                        <button className={`text-xs px-3 py-1 rounded transition-colors shadow-sm font-bold ${user.is_blocked ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                          {user.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
              {!users?.length && <tr><td colSpan={5} className="p-6 text-center text-green-800/50 dark:text-green-200/50">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
