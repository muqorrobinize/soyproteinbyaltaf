import { createClient as createServiceClient } from '@supabase/supabase-js'
import { addApiKey, toggleApiKey, deleteApiKey } from '../actions'

export const dynamic = 'force-dynamic';

export default async function AdminKeysPage() {
  const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: keys } = await supabaseAdmin.from('api_keys').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Manage AI API Keys</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel p-6 self-start">
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4">Add New Key</h3>
          <form action={addApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Name / Label</label>
              <input name="name" required placeholder="e.g. GPT-4o Key 1" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50 placeholder-green-800/30 dark:placeholder-green-200/30" />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Provider</label>
              <select name="provider" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">API Key Value</label>
              <input name="key_value" type="text" required placeholder="sk-..." className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 font-mono text-green-950 dark:text-green-50 placeholder-green-800/30 dark:placeholder-green-200/30" />
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors shadow-md">Save Key</button>
          </form>
        </div>

        <div className="md:col-span-2 glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-100/50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                  <th className="p-4 font-bold text-green-900 dark:text-green-100">Name</th>
                  <th className="p-4 font-bold text-green-900 dark:text-green-100">Provider</th>
                  <th className="p-4 font-bold text-green-900 dark:text-green-100">Status</th>
                  <th className="p-4 font-bold text-green-900 dark:text-green-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys?.map(k => (
                  <tr key={k.id} className="border-b border-green-100 dark:border-green-900/50 hover:bg-white/40 dark:hover:bg-black/20">
                    <td className="p-4 font-bold text-green-800 dark:text-green-200">{k.name}</td>
                    <td className="p-4 text-sm text-green-800 dark:text-green-200 uppercase">{k.provider}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${k.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {k.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <form action={toggleApiKey.bind(null, k.id, !k.is_active)} className="inline">
                        <button className="text-xs px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold shadow-sm">
                          {k.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </form>
                      <form action={deleteApiKey.bind(null, k.id)} className="inline">
                        <button className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors shadow-sm font-bold">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!keys?.length && <tr><td colSpan={4} className="p-6 text-center text-green-800/50 dark:text-green-200/50">No keys found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
