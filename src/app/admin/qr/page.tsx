import { createClient as createServiceClient } from '@supabase/supabase-js'
import { generateQrCode, deleteQrCode } from '../actions'
import BulkQrForm from './BulkQrForm'

export const dynamic = 'force-dynamic';

export default async function AdminQrPage() {
  const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: codes } = await supabaseAdmin.from('qr_codes').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Manage QR Codes</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Code Generator */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4">Generate Single Code</h3>
          <form action={generateQrCode} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Code Value</label>
              <input name="code" required placeholder="e.g. SOYPRO30" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 uppercase font-mono text-green-950 dark:text-green-50 placeholder-green-800/30 dark:placeholder-green-200/30" />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Duration (Days)</label>
              <input name="duration" type="number" required defaultValue="30" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors shadow-md">Generate Code</button>
          </form>
        </div>

        {/* Bulk Generator */}
        <BulkQrForm />
      </div>

      {/* QR Codes Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-100/50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Code</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Duration</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100">Status</th>
                <th className="p-4 font-bold text-green-900 dark:text-green-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes?.map(c => (
                <tr key={c.code} className="border-b border-green-100 dark:border-green-900/50 hover:bg-white/40 dark:hover:bg-black/20">
                  <td className="p-4 font-mono font-bold text-green-800 dark:text-green-200 text-sm">{c.code}</td>
                  <td className="p-4 text-green-800 dark:text-green-200">{c.duration} Days</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'unused' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteQrCode.bind(null, c.code)}>
                      <button className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors font-bold shadow-sm">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!codes?.length && <tr><td colSpan={4} className="p-6 text-center text-green-800/50 dark:text-green-200/50">No codes found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
