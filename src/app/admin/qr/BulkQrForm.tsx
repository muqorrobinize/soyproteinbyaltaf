'use client'

import { useState } from 'react'
import { bulkGenerateQrCodes } from '../actions'

export default function BulkQrForm() {
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function handleBulkGenerate(formData: FormData) {
    setLoading(true)
    try {
      const codes = await bulkGenerateQrCodes(formData)
      setGeneratedCodes(codes)
    } catch {
      alert('Failed to generate codes')
    }
    setLoading(false)
  }

  function downloadCSV() {
    const csv = 'Code\n' + generatedCodes.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr_codes_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadTXT() {
    const txt = generatedCodes.join('\n')
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr_codes_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Bulk Generate (Unique Hash)</h3>
      <form action={handleBulkGenerate} className="space-y-3">
        <div>
          <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Prefix</label>
          <input name="prefix" defaultValue="SP" placeholder="e.g. SP" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 uppercase font-mono text-green-950 dark:text-green-50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Jumlah</label>
            <input name="count" type="number" required defaultValue="10" min="1" max="500" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-800 dark:text-green-200 mb-1">Durasi (Hari)</label>
            <input name="duration" type="number" required defaultValue="30" className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors shadow-md disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Bulk Codes'}
        </button>
      </form>

      {generatedCodes.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-green-800 dark:text-green-200">{generatedCodes.length} codes generated!</p>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded font-bold hover:bg-blue-500 transition-colors">Download CSV</button>
              <button onClick={downloadTXT} className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded font-bold hover:bg-purple-500 transition-colors">Download TXT</button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto bg-black/10 dark:bg-black/30 rounded-lg p-3 font-mono text-xs text-green-800 dark:text-green-200 space-y-0.5">
            {generatedCodes.map(code => (
              <div key={code}>{code}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
