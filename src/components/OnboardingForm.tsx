'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding } from '@/app/dashboard/onboarding-actions'

interface OnboardingProps {
  userId: string
  email: string
}

export default function OnboardingForm({ userId, email }: OnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    display_name: '',
    weight_kg: '',
    height_cm: '',
    age: '',
    gender: '',
    goal: '',
    activity_level: '',
    dietary_notes: '',
  })

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const result = await saveOnboarding({
        userId,
        display_name: form.display_name || email?.split('@')[0],
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        goal: form.goal || null,
        activity_level: form.activity_level || null,
        dietary_notes: form.dietary_notes || null,
      })
      if (result?.success) {
        router.push('/dashboard?onboarding=done')
      } else {
        setError(result?.error || 'Gagal menyimpan data. Coba lagi.')
        setLoading(false)
      }
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data. Coba lagi.')
      setLoading(false)
    }
  }

  async function skip() {
    setLoading(true)
    setError('')
    try {
      const result = await saveOnboarding({
        userId,
        display_name: email?.split('@')[0],
        weight_kg: null, height_cm: null, age: null,
        gender: null, goal: null, activity_level: null, dietary_notes: null,
        skip: true,
      })
      if (result?.success) {
        router.push('/dashboard')
      } else {
        setError(result?.error || 'Gagal. Coba lagi.')
        setLoading(false)
      }
    } catch (e: any) {
      setError(e.message || 'Gagal. Coba lagi.')
      setLoading(false)
    }
  }

  const goals = [
    { value: 'bulking', label: '💪 Bulking', desc: 'Menambah massa otot' },
    { value: 'cutting', label: '🔥 Cutting', desc: 'Menurunkan lemak tubuh' },
    { value: 'maintenance', label: '⚖️ Maintenance', desc: 'Menjaga berat badan' },
  ]

  const activities = [
    { value: 'sedentary', label: '🪑 Sedentary', desc: 'Jarang olahraga' },
    { value: 'light', label: '🚶 Light', desc: '1-2x/minggu' },
    { value: 'moderate', label: '🏃 Moderate', desc: '3-4x/minggu' },
    { value: 'active', label: '🏋️ Active', desc: '5-6x/minggu' },
    { value: 'very_active', label: '⚡ Very Active', desc: 'Setiap hari' },
  ]

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-7 flex flex-col gap-5 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl mb-3">🌱</div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Setup Profil</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            AI Coach akan membuat rencana personal berdasarkan data ini
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-1.5 rounded-full transition-all" style={{
                width: s <= step ? '2.5rem' : '0.75rem',
                background: s <= step ? 'var(--accent)' : 'var(--border)',
              }} />
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Langkah {step} dari 3</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(192,57,43,0.10)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
            {error}
          </div>
        )}

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Panggilan / Nama</label>
              <input value={form.display_name} onChange={e => update('display_name', e.target.value)}
                placeholder="Nama kamu" className="input-field" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Berat (kg)</label>
                <input value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)}
                  type="number" placeholder="65" className="input-field !text-center" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tinggi (cm)</label>
                <input value={form.height_cm} onChange={e => update('height_cm', e.target.value)}
                  type="number" placeholder="170" className="input-field !text-center" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Usia</label>
                <input value={form.age} onChange={e => update('age', e.target.value)}
                  type="number" placeholder="25" className="input-field !text-center" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => update('gender', g)} className="py-3 rounded-xl font-bold border transition-all text-sm" style={form.gender === g ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : { background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                    {g === 'male' ? '👨 Pria' : '👩 Wanita'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary">Lanjut →</button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Apa tujuan utama kamu?</label>
            <div className="space-y-2">
              {goals.map(g => (
                <button key={g.value} type="button" onClick={() => update('goal', g.value)} className="w-full p-4 rounded-xl border text-left transition-all" style={form.goal === g.value ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                  <span className="font-bold text-base block" style={form.goal === g.value ? { color: '#fff' } : { color: 'var(--text-primary)' }}>{g.label}</span>
                  <span className="text-sm" style={form.goal === g.value ? { color: 'rgba(255,255,255,0.8)' } : { color: 'var(--text-muted)' }}>{g.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary !py-3">← Kembali</button>
              <button onClick={() => setStep(3)} className="btn-primary !py-3">Lanjut →</button>
            </div>
          </div>
        )}

        {/* Step 3: Activity + notes */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Level aktivitas fisik</label>
            <div className="space-y-1.5">
              {activities.map(a => (
                <button key={a.value} type="button" onClick={() => update('activity_level', a.value)} className="w-full px-4 py-3 rounded-xl border text-left transition-all flex justify-between items-center" style={form.activity_level === a.value ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                  <span className="font-bold text-sm" style={form.activity_level === a.value ? { color: '#fff' } : { color: 'var(--text-primary)' }}>{a.label}</span>
                  <span className="text-xs" style={form.activity_level === a.value ? { color: 'rgba(255,255,255,0.8)' } : { color: 'var(--text-muted)' }}>{a.desc}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Catatan diet opsional (alergi, vegetarian, dll)</label>
              <textarea value={form.dietary_notes} onChange={e => update('dietary_notes', e.target.value)}
                placeholder="Contoh: Tidak bisa makan seafood..." rows={2} className="input-field !rounded-xl resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="btn-secondary !py-3">← Kembali</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary !py-3">
                {loading ? '⏳ Menyimpan...' : '✨ Buat Plan!'}
              </button>
            </div>
          </div>
        )}

        <button onClick={skip} disabled={loading} className="text-xs text-center transition-colors" style={{ color: 'var(--text-muted)' }}>
          Lewati untuk sekarang →
        </button>
      </div>
    </div>
  )
}
