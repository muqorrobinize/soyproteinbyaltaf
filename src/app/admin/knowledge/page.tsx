import { createClient as createServiceClient } from '@supabase/supabase-js'
import { addKnowledge, toggleKnowledge, deleteKnowledge } from '../actions'

export const dynamic = 'force-dynamic';

export default async function AdminKnowledgePage() {
  const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: entries } = await supabaseAdmin.from('knowledge_base').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Knowledge Base</h2>
      <p className="text-sm text-green-800/70 dark:text-green-200/70">Tambahkan pengetahuan yang akan digunakan AI Coach sebagai acuan. AI tidak akan berimprovisasi di luar konteks knowledge base.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel p-6 self-start">
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4">Tambah Knowledge</h3>
          <form action={addKnowledge} className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Judul</label>
              <input name="title" required placeholder="e.g. Dosis Protein Kedelai" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Kategori</label>
              <select name="category" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50 text-sm">
                <option value="nutrition">🥗 Nutrition</option>
                <option value="product">📦 Product Info</option>
                <option value="training">💪 Training</option>
                <option value="general">📋 General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Konten</label>
              <textarea name="content" required rows={5} placeholder="Tulis informasi lengkap yang ingin AI gunakan..." className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50 text-sm resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors shadow-md text-sm">Tambah Knowledge</button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-3">
          {entries?.map(entry => (
            <div key={entry.id} className={`glass-panel p-5 border-l-4 ${entry.is_active ? 'border-l-green-500' : 'border-l-gray-400'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold">
                      {entry.category}
                    </span>
                    {!entry.is_active && <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 font-bold">Disabled</span>}
                  </div>
                  <h4 className="font-bold text-green-900 dark:text-green-100">{entry.title}</h4>
                  <p className="text-sm text-green-800/70 dark:text-green-200/70 mt-1 whitespace-pre-wrap line-clamp-3">{entry.content}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={toggleKnowledge.bind(null, entry.id, !entry.is_active)}>
                    <button className={`text-xs px-3 py-1 rounded font-bold transition-colors ${entry.is_active ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                      {entry.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </form>
                  <form action={deleteKnowledge.bind(null, entry.id)}>
                    <button className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors font-bold">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {!entries?.length && (
            <div className="glass-panel p-8 text-center text-green-800/50 dark:text-green-200/50">
              <div className="text-3xl mb-2">📚</div>
              <p className="font-bold">Belum ada knowledge base.</p>
              <p className="text-sm mt-1">Tambahkan informasi produk, nutrisi, dan training agar AI Coach memberikan jawaban yang akurat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
