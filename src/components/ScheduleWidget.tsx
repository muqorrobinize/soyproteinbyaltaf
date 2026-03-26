'use client'

interface ScheduleItem {
  time: string
  label: string
  done: boolean
  icon: string
}

interface ScheduleWidgetProps {
  weightKg?: number
  goal?: string
  streakCount?: number
}

function computeSchedule(goal: string | undefined, weightKg: number | undefined): ScheduleItem[] {
  const protein = weightKg ? Math.round(weightKg * (goal === 'bulking' ? 1.8 : 1.5)) : 90
  const serving = Math.round(protein / 25)

  const base: ScheduleItem[] = [
    { time: '07:00', label: `Sarapan + Soy Protein #1 (25g)`, done: false, icon: '🌅' },
    { time: '12:30', label: `Makan siang — fokus protein & sayur`, done: false, icon: '🥗' },
    { time: '15:00', label: `Snack sehat (buah / kacang)`, done: false, icon: '🍎' },
    { time: '17:00', label: `Olahraga / aktivitas fisik`, done: false, icon: '🏋️' },
    { time: '18:30', label: `Soy Protein #2 post-workout (25g)`, done: false, icon: '💪' },
    { time: '20:00', label: `Makan malam — hindari karbohidrat berat`, done: false, icon: '🌙' },
  ]

  if (serving >= 3) {
    base.splice(2, 0, { time: '10:00', label: 'Soy Protein #2 (25g) — mid-morning', done: false, icon: '🥤' })
  }

  if (goal === 'cutting') {
    base[2].label = 'Snack rendah kalori (mentimun / wortel)'
  } else if (goal === 'bulking') {
    base[2].label = 'Snack tinggi kalori (pisang + oat)'
    base.push({ time: '22:00', label: 'Soy Protein sebelum tidur (25g)', done: false, icon: '😴' })
  }

  // Mark done based on current time
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return base.map(item => {
    const [h, m] = item.time.split(':').map(Number)
    return { ...item, done: h * 60 + m < nowMinutes - 30 }
  })
}

export default function ScheduleWidget({ weightKg, goal, streakCount }: ScheduleWidgetProps) {
  const schedule = computeSchedule(goal, weightKg)
  const done = schedule.filter(s => s.done).length
  const progress = Math.round((done / schedule.length) * 100)

  return (
    <div className="glass-panel p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>Jadwal Hari Ini</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {goal ? `Mode: ${goal.charAt(0).toUpperCase() + goal.slice(1)}` : 'Nutrition plan harian'}
            {weightKg ? ` · Target protein ~${Math.round(weightKg * (goal === 'bulking' ? 1.8 : 1.5))}g` : ''}
          </p>
        </div>
        {streakCount !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{streakCount}🔥</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>streak</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{done}/{schedule.length} selesai</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
        {schedule.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${item.done ? 'opacity-50' : ''}`} style={{ background: item.done ? 'transparent' : 'var(--surface-hover)', border: `1px solid ${item.done ? 'transparent' : 'var(--border)'}` }}>
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${item.done ? 'line-through' : ''}`} style={{ color: item.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                {item.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
            </div>
            <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs ${item.done ? 'text-white' : ''}`} style={{ background: item.done ? 'var(--accent)' : 'var(--border)' }}>
              {item.done ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
