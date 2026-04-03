'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/dashboard/actions'
import { ExportPdfButton } from '@/components/ExportPdfButton'

interface ProfileViewProps {
  profile: any
}

export default function ProfileView({ profile }: ProfileViewProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    weight_kg: profile?.weight_kg?.toString() || '',
    height_cm: profile?.height_cm?.toString() || '',
    age: profile?.age?.toString() || '',
    goal: profile?.goal || 'maintenance',
    activity_level: profile?.activity_level || 'moderate',
  })

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSave() {
    setMessage('')
    startTransition(async () => {
      const result = await updateProfile({
        display_name: form.display_name,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        age: form.age ? parseInt(form.age) : null,
        goal: form.goal,
        activity_level: form.activity_level,
      })
      if (result.success) {
        setMessage('✅ Profil berhasil diperbarui!')
      } else {
        setMessage('❌ Gagal menyimpan. Coba lagi.')
      }
    })
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 sm:p-10 space-y-10">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <section className="space-y-1">
          <h2 className="text-2xl font-black">Profil & AI Memory</h2>
          <p className="text-sm opacity-60">Atur data kamu agar AI Coach bisa memberikan saran yang tepat.</p>
        </section>

        {message && (
          <div className={`p-4 rounded-2xl text-sm font-bold animate-fade-in ${message.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider opacity-50">Nama Panggilan</label>
            <input 
              value={form.display_name} 
              onChange={e => update('display_name', e.target.value)}
              className="input-field" 
              placeholder="Nama kamu"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider opacity-50">Berat (kg)</label>
              <input 
                type="number"
                value={form.weight_kg} 
                onChange={e => update('weight_kg', e.target.value)}
                className="input-field !text-center" 
                placeholder="65"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider opacity-50">Tinggi (cm)</label>
              <input 
                type="number"
                value={form.height_cm} 
                onChange={e => update('height_cm', e.target.value)}
                className="input-field !text-center" 
                placeholder="170"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider opacity-50">Usia</label>
              <input 
                type="number"
                value={form.age} 
                onChange={e => update('age', e.target.value)}
                className="input-field !text-center" 
                placeholder="25"
              />
            </div>
          </div>
        </div>

        {/* Goal & Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider opacity-50">Tujuan Utama</label>
            <select 
              value={form.goal} 
              onChange={e => update('goal', e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="bulking">💪 Bulking</option>
              <option value="cutting">🔥 Cutting</option>
              <option value="maintenance">⚖️ Maintenance</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider opacity-50">Aktivitas</label>
            <select 
              value={form.activity_level} 
              onChange={e => update('activity_level', e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="sedentary">🪑 Sedentary (Jarang gerak)</option>
              <option value="light">🚶 Light (1-2x gym)</option>
              <option value="moderate">🏃 Moderate (3-4x gym)</option>
              <option value="active">🏋️ Active (5-6x gym)</option>
            </select>
          </div>
        </div>

        {/* AI Memory / Notes preview */}
        <div className="bg-zinc-50 dark:bg-white/5 p-6 rounded-[2rem] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🧠</span>
            <h3 className="font-bold">AI Context & Memory</h3>
          </div>
          <div className="space-y-3 text-sm leading-relaxed opacity-70">
            <p>Data berikut otomatis digunakan oleh AI Coach untuk memberikan saran:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 font-bold">BMI: {profile?.weight_kg && profile?.height_cm ? (profile.weight_kg / Math.pow(profile.height_cm/100, 2)).toFixed(1) : '-'}</span>
              <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 font-bold">Goal: {form.goal}</span>
              <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 font-bold">Aktivitas: {form.activity_level}</span>
            </div>
            {profile?.dietary_notes && (
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-black/20 border border-[var(--border)]">
                <p className="font-bold mb-1 opacity-100">Saved Facts / Notes:</p>
                <p>{profile.dietary_notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 items-center w-full">
          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="btn-primary flex-1"
          >
            {isPending ? '⏳ Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <div className="flex-1 mt-4 sm:mt-0">
            <ExportPdfButton userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
