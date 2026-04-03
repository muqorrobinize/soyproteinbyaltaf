'use client'

import { useState } from 'react'
import { bulkGenerateQrCodes } from '../actions'

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://NutriSoybyaltaf.vercel.app'

export default function BulkQrForm() {
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

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

  async function generateQrDataUrl(code: string): Promise<string> {
    const QRCode = (await import('qrcode')).default
    const url = `${APP_URL}/redeem?code=${encodeURIComponent(code)}`
    return QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: '#166534', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }

  async function downloadSingleQr(code: string) {
    const dataUrl = await generateQrDataUrl(code)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `QR_${code}.png`
    a.click()
  }

  async function downloadAllQrZip() {
    setDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const folder = zip.folder('qr_codes')!

      for (const code of generatedCodes) {
        const dataUrl = await generateQrDataUrl(code)
        const base64 = dataUrl.split(',')[1]
        folder.file(`QR_${code}.png`, base64, { base64: true })
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr_codes_${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error creating ZIP: ' + e)
    }
    setDownloading(false)
  }

  function downloadCSV() {
    const csv = 'Code,URL\n' + generatedCodes.map(c => `${c},${APP_URL}/redeem?code=${encodeURIComponent(c)}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr_codes_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Bulk Generate QR</h3>
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
          {loading ? 'Generating...' : 'Generate Bulk QR Codes'}
        </button>
      </form>

      {generatedCodes.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-bold text-green-800 dark:text-green-200">{generatedCodes.length} codes generated!</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={downloadAllQrZip} disabled={downloading} className="px-3 py-1.5 bg-green-700 text-white text-xs rounded font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
                {downloading ? 'Zipping...' : '📦 Download QR Images (ZIP)'}
              </button>
              <button onClick={downloadCSV} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded font-bold hover:bg-blue-500 transition-colors">📄 CSV</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto bg-black/5 dark:bg-black/20 rounded-lg p-3">
            {generatedCodes.map(code => (
              <button key={code} onClick={() => downloadSingleQr(code)} className="p-2 bg-white/60 dark:bg-black/30 rounded-lg text-xs font-mono text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center break-all border border-green-200/50 dark:border-green-800/50" title="Click to download QR image">
                📱 {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
