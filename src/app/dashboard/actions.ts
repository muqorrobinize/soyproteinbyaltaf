'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logIntake() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  // Check if already logged today
  const { data: existing } = await supabase
    .from('tracking')
    .select('id')
    .eq('user_id', user.id)
    .eq('tracked_date', today)
    .single()

  if (existing) {
    return { already: true }
  }

  // Insert tracking entry
  await supabase.from('tracking').insert({
    user_id: user.id,
    tracked_date: today,
    intake_logged: true,
  })

  // Update streak
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('users')
    .select('streak_count, last_tracked_date')
    .eq('id', user.id)
    .single()

  let newStreak = 1
  if (profile?.last_tracked_date === yesterdayStr) {
    newStreak = (profile.streak_count || 0) + 1
  }

  await supabase.from('users').update({
    streak_count: newStreak,
    last_tracked_date: today,
  }).eq('id', user.id)

  revalidatePath('/dashboard')
  return { success: true, streak: newStreak }
}
