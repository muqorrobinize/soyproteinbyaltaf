'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimTrial(userId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) throw new Error('Unauthorized')

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already has or had a subscription
    const { data: profile } = await admin.from('users').select('subscription_end, trial_claimed').eq('id', userId).single()
    
    if (profile?.trial_claimed) {
      return { success: false, error: 'Trial sudah pernah diambil.' }
    }

    const trialDate = new Date()
    trialDate.setDate(trialDate.getDate() + 1)
    
    const { error } = await admin.from('users').update({
      subscription_end: trialDate.toISOString(),
      trial_claimed: true
    }).eq('id', userId)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
