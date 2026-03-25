'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function redeemCode(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const code = formData.get('code') as string
  if (!code) {
    redirect('/redeem?error=Please enter a code')
  }

  // Use service role client to bypass RLS for secure server validation
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Check if code exists and is unused
  const { data: qrData, error: qrError } = await supabaseAdmin
    .from('qr_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (qrError || !qrData) {
    redirect('/redeem?error=Invalid QR code')
  }

  if (qrData.status !== 'unused') {
    redirect('/redeem?error=This code has already been used')
  }

  // 2. Mark code as used
  const { error: updateQrError } = await supabaseAdmin
    .from('qr_codes')
    .update({ status: 'used' })
    .eq('code', code.toUpperCase())

  if (updateQrError) {
    redirect('/redeem?error=Error redeeming code')
  }

  // 3. Update user's subscription
  // Fetch current user profile to get existing subscription_end
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('subscription_end')
    .eq('id', user.id)
    .single()

  let newSubscriptionEnd = new Date()
  if (userData?.subscription_end && new Date(userData.subscription_end) > new Date()) {
    newSubscriptionEnd = new Date(userData.subscription_end)
  }
  
  // Add duration (days)
  newSubscriptionEnd.setDate(newSubscriptionEnd.getDate() + qrData.duration)

  // Update user profile
  await supabaseAdmin
    .from('users')
    .update({ subscription_end: newSubscriptionEnd.toISOString() })
    .eq('id', user.id)

  // 4. Insert into redemptions
  await supabaseAdmin
    .from('redemptions')
    .insert({
      user_id: user.id,
      code: code.toUpperCase()
    })

  // Trigger Make.com Automation webhook (if configured)
  if (process.env.MAKE_WEBHOOK_URL) {
    try {
      fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'qr_redeemed',
          user_id: user.id,
          code: code.toUpperCase(),
          new_subscription_end: newSubscriptionEnd.toISOString()
        }),
      }).catch(console.error)
    } catch (e) {
      console.error('Webhook error:', e)
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?success=Code redeemed successfully!')
}
