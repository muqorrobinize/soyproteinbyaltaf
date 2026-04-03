'use client'

import { useState } from 'react'
import { addAdminConcern } from '@/app/actions/report'

export function AdminConcernForm({ userId, existingNotes }: { userId: string, existingNotes?: string }) {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    if (!note.trim()) return;
    setLoading(true)
    setMessage('')
    try {
      await addAdminConcern(userId, note)
      setMessage('✅ Sent')
      setNote('')
    } catch (e: any) {
      setMessage('❌ Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div className="mt-2 space-y-2 pb-2">
      <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Send Concern to User AI Memory:</div>
      <div className="flex gap-2">
        <input 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Kurangi kalori jadi 1500 kcal"
          className="input-field !py-1 !px-2 text-xs flex-1"
          style={{ minWidth: '150px' }}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !note}
          className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors shadow-sm font-bold disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
      {message && <div className="text-xs font-bold">{message}</div>}
    </div>
  )
}
