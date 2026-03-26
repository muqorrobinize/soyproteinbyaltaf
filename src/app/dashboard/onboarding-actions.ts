'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveOnboarding(data: {
  userId: string
  display_name: string
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  gender: string | null
  goal: string | null
  activity_level: string | null
  dietary_notes: string | null
  skip?: boolean
}) {
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== data.userId) throw new Error('Unauthorized')

  // Use service role to bypass RLS — so it works even if row doesn't exist yet
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin.from('users').upsert({
    id: data.userId,
    email: user.email,
    display_name: data.display_name || user.email?.split('@')[0],
    weight_kg: data.skip ? null : data.weight_kg,
    height_cm: data.skip ? null : data.height_cm,
    age: data.skip ? null : data.age,
    gender: data.skip ? null : data.gender,
    goal: data.skip ? null : data.goal,
    activity_level: data.skip ? null : data.activity_level,
    dietary_notes: data.skip ? null : data.dietary_notes,
    onboarding_complete: true,
  }, { onConflict: 'id' })

  if (error) {
    console.error('Onboarding save error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard', 'page')
  redirect(data.skip ? '/dashboard' : '/dashboard?onboarding=done')
}
