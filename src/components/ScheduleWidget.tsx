import { useState, useTransition } from 'react'
import { toggleDailyTask } from '@/app/dashboard/actions'

interface ScheduleItem {
  time: string
  label: string
  icon: string
}

interface ScheduleWidgetProps {
  weightKg?: number
  goal?: string
  streakCount?: number
  dailyProgress?: number[]
}

function getBaseSchedule(goal: string | undefined, weightKg: number | undefined): ScheduleItem[] {
  const protein = weightKg ? Math.round(weightKg * (goal === 'bulking' ? 1.8 : 1.5)) : 90
  const serving = Math.round(protein / 25)

  const base: ScheduleItem[] = [
    { time: '07:00', label: `Sarapan + Soy Protein #1 (25g)`, icon: '🌅' },
    { time: '12:30', label: `Makan siang — fokus protein & sayur`, icon: '🥗' },
    { time: '15:00', label: `Snack sehat (buah / kacang)`, icon: '🍎' },
    { time: '17:00', label: `Olahraga / aktivitas fisik`, icon: '🏋️' },
    { time: '18:30', label: `Soy Protein #2 post-workout (25g)`, icon: '💪' },
    { time: '20:00', label: `Makan malam — hindari karbohidrat berat`, icon: '🌙' },
  ]

  if (serving >= 3) {
    base.splice(2, 0, { time: '10:00', label: 'Soy Protein #2 (25g) — mid-morning', icon: '🥤' })
  }

  if (goal === 'cutting') {
    base[2].label = 'Snack rendah kalori (mentimun / wortel)'
  } else if (goal === 'bulking') {
    base[2].label = 'Snack tinggi kalori (pisang + oat)'
    base.push({ time: '22:00', label: 'Soy Protein sebelum tidur (25g)', icon: '😴' })
  }

  return base
}

export default function ScheduleWidget({ weightKg, goal, streakCount, dailyProgress = [] }: ScheduleWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [localProgress, setLocalProgress] = useState<number[]>(dailyProgress)
  const schedule = getBaseSchedule(goal, weightKg)
  
  const doneCount = localProgress.length
  const progress = Math.round((doneCount / schedule.length) * 100)

  async function handleToggle(index: number) {
    // Optimistic update
    const newProgress = localProgress.includes(index)
      ? localProgress.filter(i => i !== index)
      : [...localProgress, index]
    
    setLocalProgress(newProgress)
    
    startTransition(async () => {
      await toggleDailyTask(index, dailyProgress)
    })
  }

  return (
    <div className="glass-panel p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>Jadwal Nutrisi</h3>
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
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Harian</span>
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{doneCount}/{schedule.length} selesai</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
        {schedule.map((item, i) => {
          const isDone = localProgress.includes(i)
          return (
            <button
              key={i}
              onClick={() => handleToggle(i)}
              disabled={isPending}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isDone ? 'opacity-50' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              style={{ 
                background: isDone ? 'transparent' : 'var(--surface-hover)', 
                border: `1px solid ${isDone ? 'transparent' : 'var(--border)'}`,
                cursor: 'pointer'
              }}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs font-bold truncate ${isDone ? 'line-through' : ''}`} style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {item.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
              </div>
              <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs transition-all ${isDone ? 'text-white scale-110' : ''}`} style={{ background: isDone ? 'var(--accent)' : 'var(--surface-active)', border: `1px solid ${isDone ? 'var(--accent)' : 'var(--border)'}` }}>
                {isDone ? '✓' : ''}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
