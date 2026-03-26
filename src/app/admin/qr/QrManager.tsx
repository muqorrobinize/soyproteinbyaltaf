'use client'

import { useState } from 'react'
import { generateQrCode, bulkGenerateQrCodes, deleteQrCode } from '../actions'

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://soyproteinbyaltaf.vercel.app'

interface QrCode {
  code: string
  duration: number
  status: string
}

interface Props {
  initialCodes: QrCode[]
}

export default function QrManager({ initialCodes }: Props) {
  const [codes, setCodes] = useState<QrCode[]>(initialCodes)
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [bulkGenerated, setBulkGenerated] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('all')

  async function getQrDataUrl(code: string) {
    const QRCode = (await import('qrcode')).default
    const url = `${APP_URL}/redeem?code=${encodeURIComponent(code)}`
    return QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a3a24',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
  }

  async function showPreview(code: string) {
    setPreviewCode(code)
    setPreviewDataUrl('')
    const url = await getQrDataUrl(code)
    setPreviewDataUrl(url)
  }

  async function downloadQr(code: string) {
    const dataUrl = await getQrDataUrl(code)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `QR_${code}.png`
    a.click()
  }

  async function handleSingle(fd: FormData) {
    setLoading(true)
    try {
      await generateQrCode(fd)
      // Refresh list
      const code = (fd.get('code') as string).toUpperCase()
      const duration = parseInt(fd.get('duration') as string)
      setCodes(prev => [{ code, duration, status: 'unused' }, ...prev])
    } finally {
      setLoading(false)
    }
  }

  async function handleBulk(fd: FormData) {
    setLoading(true)
    try {
      const newCodes = await bulkGenerateQrCodes(fd)
      setBulkGenerated(newCodes)
      const duration = parseInt(fd.get('duration') as string)
      setCodes(prev => [...newCodes.map(c => ({ code: c, duration, status: 'unused' })), ...prev])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(code: string) {
    await deleteQrCode(code)
    setCodes(prev => prev.filter(c => c.code !== code))
    if (previewCode === code) setPreviewCode(null)
  }

  async function downloadBulkZip() {
    setDownloading(true)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const folder = zip.folder('qr_codes')!
    for (const code of bulkGenerated) {
      const url = await getQrDataUrl(code)
      folder.file(`QR_${code}.png`, url.split(',')[1], { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `QR_bulk_${new Date().toISOString().slice(0,10)}.zip`
    a.click()
    setDownloading(false)
  }

  const filtered = codes.filter(c => filter === 'all' ? true : c.status === filter)

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Left panel: generator */}
      <div className="lg:col-span-1 space-y-4">
        {/* Mode tabs */}
        <div className="glass-panel p-1 flex gap-1">
          <button onClick={() => setMode('single')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'single' ? 'text-white' : ''}`} style={mode === 'single' ? { background: 'var(--accent)' } : { color: 'var(--text-muted)' }}>
            Single
          </button>
          <button onClick={() => setMode('bulk')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'bulk' ? 'text-white' : ''}`} style={mode === 'bulk' ? { background: 'var(--accent)' } : { color: 'var(--text-muted)' }}>
            Bulk
          </button>
        </div>

        {mode === 'single' && (
          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>Generate Satu Kode</h3>
            <form action={handleSingle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Kode</label>
                <input name="code" required placeholder="SOYPRO30" className="input-field !font-mono uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Durasi (hari)</label>
                <input name="duration" type="number" required defaultValue="30" className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary !py-3 text-sm">
                {loading ? 'Generating...' : '+ Generate'}
              </button>
            </form>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>Bulk Generate</h3>
            <form action={handleBulk} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Prefix</label>
                <input name="prefix" defaultValue="SP" className="input-field !font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Jumlah</label>
                  <input name="count" type="number" required defaultValue="10" min="1" max="500" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Durasi</label>
                  <input name="duration" type="number" required defaultValue="30" className="input-field" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary !py-3 text-sm">
                {loading ? 'Generating...' : '⚡ Bulk Generate'}
              </button>
            </form>
            {bulkGenerated.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{bulkGenerated.length} kode dibuat</p>
                <button onClick={downloadBulkZip} disabled={downloading} className="btn-primary !py-2.5 text-sm">
                  {downloading ? 'Zipping...' : '📦 Download ZIP'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* QR Preview */}
        {previewCode && (
          <div className="glass-panel p-5 text-center space-y-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>Preview QR</h3>
            {previewDataUrl ? (
              <>
                <img src={previewDataUrl} alt={previewCode} className="w-full max-w-[180px] mx-auto rounded-xl shadow-md" />
                <p className="font-mono text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{previewCode}</p>
                <button onClick={() => downloadQr(previewCode)} className="btn-primary !py-2.5 text-sm">
                  ⬇️ Download PNG
                </button>
              </>
            ) : (
              <div className="w-32 h-32 mx-auto rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
            )}
          </div>
        )}
      </div>

      {/* Right panel: codes list */}
      <div className="lg:col-span-2 glass-panel overflow-hidden">
        {/* Filter tabs */}
        <div className="flex gap-2 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-bold mr-2" style={{ color: 'var(--text-secondary)' }}>Filter:</span>
          {(['all', 'unused', 'used'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1 rounded-lg text-xs font-bold transition-all" style={filter === f ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{filtered.length} kode</span>
        </div>

        <div className="overflow-auto max-h-[500px] custom-scroll">
          <table className="w-full text-left">
            <thead className="sticky top-0" style={{ background: 'var(--surface)' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Kode</th>
                <th className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Durasi</th>
                <th className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-4 py-3 text-xs font-bold text-right" style={{ color: 'var(--text-muted)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.code} onClick={() => showPreview(c.code)} className="cursor-pointer transition-colors border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: previewCode === c.code ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{c.duration}h</td>
                  <td className="px-4 py-3">
                    <span className={c.status === 'unused' ? 'badge-active' : 'badge-inactive'}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => downloadQr(c.code)} className="text-xs px-2 py-1 font-bold rounded-lg transition-all" style={{ color: 'var(--accent)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        📷
                      </button>
                      <button onClick={() => handleDelete(c.code)} className="btn-danger !px-2 !py-1 !text-xs !rounded-lg">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada kode ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
