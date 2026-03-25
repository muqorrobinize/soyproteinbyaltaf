import { createClient as createServiceClient } from '@supabase/supabase-js'
import { toggleUserBlock, makeUserAdmin } from '../actions'

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
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Subscription End</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr key={user.id} className="border-b border-green-100 dark:border-green-900/50 hover:bg-white/40 dark:hover:bg-black/20">
                  <td className="p-4 text-green-800 dark:text-green-200">{user.email || 'N/A'}</td>
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
                  <td className="p-4 text-sm text-green-800/70 dark:text-green-200/70">
                    {user.subscription_end ? new Date(user.subscription_end).toLocaleDateString() : 'None'}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {user.role !== 'admin' && (
                      <form action={makeUserAdmin.bind(null, user.id)} className="inline">
                        <button className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors shadow-sm font-bold">Make Admin</button>
                      </form>
                    )}
                    <form action={toggleUserBlock.bind(null, user.id, !user.is_blocked)} className="inline">
                      <button className={`text-xs px-3 py-1 rounded transition-colors shadow-sm font-bold ${user.is_blocked ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!users?.length && <tr><td colSpan={5} className="p-6 text-center text-green-800/50 dark:text-green-200/50">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
