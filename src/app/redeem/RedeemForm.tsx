'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { redeemCode } from './actions'

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false })

interface RedeemFormProps {
  initialCode?: string
}

export default function RedeemForm({ initialCode }: RedeemFormProps) {
  const [code, setCode] = useState(initialCode || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialCode) setCode(initialCode.toUpperCase())
  }, [initialCode])

  function handleScan(scanned: string) {
    setCode(scanned.toUpperCase())
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return setError('Masukkan kode terlebih dahulu')
    setLoading(true)
    const fd = new FormData()
    fd.append('code', code.trim().toUpperCase())
    await redeemCode(fd)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* QR Scanner */}
      <QrScanner onScan={handleScan} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>ATAU KETIK MANUAL</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Kode Produk</label>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          type="text"
          className="input-field !text-center !font-mono !text-xl !tracking-widest"
          placeholder="SP-XXXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {error && (
        <p className="text-sm text-center font-semibold" style={{ color: 'var(--danger)' }}>{error}</p>
      )}

      <button type="submit" disabled={loading || !code.trim()} className="btn-primary">
        {loading ? '⏳ Memproses...' : '🎁 Aktivasi Kode'}
      </button>
    </form>
  )
}
