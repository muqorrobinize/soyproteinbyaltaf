'use client'

import { useState } from 'react'
import { logIntake } from '@/app/dashboard/actions'

interface TrackingWidgetProps {
  alreadyTrackedToday: boolean
  streakCount: number
  recentDays: { date: string; logged: boolean }[]
}

export default function TrackingWidget({ alreadyTrackedToday, streakCount, recentDays }: TrackingWidgetProps) {
  const [tracked, setTracked] = useState(alreadyTrackedToday)
  const [streak, setStreak] = useState(streakCount)
  const [loading, setLoading] = useState(false)

  async function handleTrack() {
    setLoading(true)
    try {
      const result = await logIntake()
      if (result.success) {
        setTracked(true)
        setStreak(result.streak || streak + 1)
      } else if (result.already) {
        setTracked(true)
      }
    } catch {
      alert('Gagal menyimpan data')
    }
    setLoading(false)
  }

  return (
    <div className="glass-panel p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tracking Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleTrack}
            disabled={tracked || loading}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl font-bold transition-all shadow-lg ${
              tracked
                ? 'bg-green-500 text-white scale-95 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-500 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            {tracked ? (
              <span className="text-2xl sm:text-3xl">✅</span>
            ) : loading ? (
              <span className="text-lg">⏳</span>
            ) : (
              <span className="text-2xl sm:text-3xl">🥤</span>
            )}
          </button>
          <div>
            <p className="font-bold text-green-900 dark:text-green-100 text-sm sm:text-base">
              {tracked ? 'Konsumsi hari ini tercatat!' : 'Sudah konsumsi hari ini?'}
            </p>
            <p className="text-xs text-green-800/60 dark:text-green-200/60">
              {tracked ? 'Bagus! Tetap konsisten.' : 'Klik untuk mencatat konsumsi'}
            </p>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300">
              {streak}
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-xs font-bold text-green-800/60 dark:text-green-200/60">Streak</p>
          </div>
        </div>
      </div>

      {/* 7-day progress */}
      <div className="mt-4 flex gap-1 justify-center sm:justify-start">
        {recentDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              day.logged
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-green-100/50 dark:bg-green-900/30 text-green-800/30 dark:text-green-200/30 border border-green-200/50 dark:border-green-800/50'
            }`}>
              {day.logged ? '✓' : '·'}
            </div>
            <span className="text-[10px] text-green-800/50 dark:text-green-200/50">
              {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
