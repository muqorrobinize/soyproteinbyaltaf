'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

    const { error } = await supabase
      .from('users')
      .update({ 
        daily_progress: newProgress,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, progress: newProgress }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

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
    return { success: false, error: e.message }
  }
}
