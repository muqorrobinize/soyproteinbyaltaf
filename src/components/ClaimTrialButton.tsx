'use client'

import { useState } from 'react'
import { claimTrial } from '@/app/dashboard/trial-actions'

export function ClaimTrialButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClaim() {
    setLoading(true)
    setError('')
    const res = await claimTrial(userId)
    if (res.success) {
      window.location.reload() // Quickest way to refresh all server-side data
    } else {
      setError(res.error || 'Gagal mengambil trial.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button 
        onClick={handleClaim} 
        disabled={loading}
        className="btn-primary !w-auto !px-10 !py-4 shadow-xl !rounded-2xl"
      >
        {loading ? '⏳ Memproses...' : '🎁 Jalankan Trial 1 Hari (Gratis)'}
      </button>
      {error && <p className="text-xs font-bold" style={{ color: 'var(--danger)' }}>{error}</p>}
      <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>Berlaku 1 kali untuk setiap akun</p>
    </div>
  )
}
