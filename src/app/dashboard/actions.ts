'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Toggles a daily task in the manual checklist.
 */
export async function toggleDailyTask(itemIndex: number, currentProgress: number[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    let newProgress = [...currentProgress]
    if (newProgress.includes(itemIndex)) {
      newProgress = newProgress.filter(i => i !== itemIndex)
    } else {
      newProgress.push(itemIndex)
    }

    const todayStr = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('users')
      .update({ 
        daily_progress: newProgress,
        last_activity_date: todayStr
      })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, progress: newProgress }
  } catch (e: any) {
    console.error('toggleDailyTask error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Updates the user's profile information.
 */
export async function updateProfile(data: {
  display_name: string
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  goal: string | null
  activity_level: string | null
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: any) {
    console.error('updateProfile error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * Logs the daily soy protein consumption.
 */
export async function logIntake() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const today = new Date().toISOString().split('T')[0]

    // 1. Check if already tracked today
    const { data: existing } = await supabase
      .from('tracking')
      .select('id')
      .eq('user_id', user.id)
      .eq('tracked_date', today)
      .maybeSingle()

    if (existing) return { success: true, already: true }

    // 2. Log intake
    const { error: logError } = await supabase
      .from('tracking')
      .insert({ 
        user_id: user.id, 
        tracked_date: today, 
        intake_logged: true 
      })

    if (logError) throw logError

    // 3. Update streak count
    const { data: profile } = await supabase
      .from('users')
      .select('streak_count, last_activity_date')
      .eq('id', user.id)
      .single()

    let newStreak = (profile?.streak_count || 0) + 1
    
    // Streak logic could be refined but this is the baseline
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        streak_count: newStreak,
        last_activity_date: today 
      })
      .eq('id', user.id)

    if (userError) throw userError

    revalidatePath('/dashboard')
    return { success: true, streak: newStreak }
  } catch (e: any) {
    console.error('logIntake error:', e)
    return { success: false, error: e.message }
  }
}
