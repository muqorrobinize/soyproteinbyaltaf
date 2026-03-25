'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface OnboardingProps {
  userId: string
  email: string
}

export default function OnboardingForm({ userId, email }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
  const router = useRouter()

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({
      display_name: form.display_name || email?.split('@')[0],
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      goal: form.goal || null,
      activity_level: form.activity_level || null,
      dietary_notes: form.dietary_notes || null,
      onboarding_complete: true,
    }).eq('id', userId)
    
    router.refresh()
  }

  async function skip() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({
      display_name: email?.split('@')[0],
      onboarding_complete: true,
    }).eq('id', userId)
    router.refresh()
  }

  const goals = [
    { value: 'bulking', label: '💪 Bulking', desc: 'Menambah massa otot' },
    { value: 'cutting', label: '🔥 Cutting', desc: 'Menurunkan lemak' },
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-8 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Welcome to SoyProtein!</h1>
          <p className="text-sm text-green-800/70 dark:text-green-200/70 mt-1">Bantu AI Coach mengenal Anda lebih baik</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-16 h-1.5 rounded-full transition-all ${s <= step ? 'bg-green-500' : 'bg-green-200 dark:bg-green-800'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">Nama</label>
              <input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="Nama Anda" className="w-full p-3 rounded-xl border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">Berat (kg)</label>
                <input value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} type="number" placeholder="65" className="w-full p-3 rounded-xl border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">Tinggi (cm)</label>
                <input value={form.height_cm} onChange={e => update('height_cm', e.target.value)} type="number" placeholder="170" className="w-full p-3 rounded-xl border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">Usia</label>
                <input value={form.age} onChange={e => update('age', e.target.value)} type="number" placeholder="25" className="w-full p-3 rounded-xl border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2">Gender</label>
              <div className="flex gap-3">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => update('gender', g)} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${form.gender === g ? 'bg-green-600 text-white border-green-600' : 'bg-white/50 dark:bg-black/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 hover:border-green-400'}`}>
                    {g === 'male' ? '👨 Pria' : '👩 Wanita'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all">Lanjut →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-green-900 dark:text-green-100">Apa tujuan utama Anda?</label>
            <div className="space-y-3">
              {goals.map(g => (
                <button key={g.value} type="button" onClick={() => update('goal', g.value)} className={`w-full p-4 rounded-xl border text-left transition-all ${form.goal === g.value ? 'bg-green-600 text-white border-green-600' : 'bg-white/50 dark:bg-black/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 hover:border-green-400'}`}>
                  <span className="font-bold text-lg">{g.label}</span>
                  <span className="block text-sm mt-0.5 opacity-80">{g.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/50 dark:bg-black/20 text-green-800 dark:text-green-200 rounded-xl font-bold border border-green-200 dark:border-green-800">← Kembali</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all">Lanjut →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-green-900 dark:text-green-100">Level aktivitas fisik</label>
            <div className="space-y-2">
              {activities.map(a => (
                <button key={a.value} type="button" onClick={() => update('activity_level', a.value)} className={`w-full p-3 rounded-xl border text-left transition-all ${form.activity_level === a.value ? 'bg-green-600 text-white border-green-600' : 'bg-white/50 dark:bg-black/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 hover:border-green-400'}`}>
                  <span className="font-bold">{a.label}</span> <span className="text-sm opacity-80">{a.desc}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">Catatan diet (alergi, preferensi, dll)</label>
              <textarea value={form.dietary_notes} onChange={e => update('dietary_notes', e.target.value)} placeholder="Contoh: Alergi kacang, vegetarian..." rows={2} className="w-full p-3 rounded-xl border border-green-200 dark:border-green-800 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-green-500 text-green-950 dark:text-green-50 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/50 dark:bg-black/20 text-green-800 dark:text-green-200 rounded-xl font-bold border border-green-200 dark:border-green-800">← Kembali</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all disabled:opacity-50">
                {loading ? 'Menyimpan...' : '✨ Mulai!'}
              </button>
            </div>
          </div>
        )}

        <button onClick={skip} disabled={loading} className="w-full text-sm text-green-800/50 dark:text-green-200/50 hover:text-green-800 dark:hover:text-green-200 transition-colors">
          Lewati untuk sekarang →
        </button>
      </div>
    </div>
  )
}
