'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  if (user.email === 'muqorroben@gmail.com') return true;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  return profile?.role === 'admin'
}

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// User Actions
export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('users').update({ is_blocked: isBlocked }).eq('id', userId)
  revalidatePath('/admin/users')
}

export async function makeUserAdmin(userId: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('users').update({ role: 'admin' }).eq('id', userId)
  revalidatePath('/admin/users')
}

// QR Actions
export async function generateQrCode(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const code = formData.get('code') as string
  const duration = parseInt(formData.get('duration') as string)
  
  if (!code || !duration) throw new Error('Invalid input')

  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('qr_codes').insert({ code: code.toUpperCase(), duration, status: 'unused' })
  revalidatePath('/admin/qr')
}

export async function deleteQrCode(code: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('qr_codes').delete().eq('code', code)
  revalidatePath('/admin/qr')
}

// API Key Actions
export async function addApiKey(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const provider = formData.get('provider') as string || 'openai'
  const name = formData.get('name') as string
  const key_value = formData.get('key_value') as string
  
  if (!name || !key_value) throw new Error('Invalid input')

  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('api_keys').insert({ provider, name, key_value, is_active: true })
  revalidatePath('/admin/keys')
}

export async function toggleApiKey(id: string, isActive: boolean) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('api_keys').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/keys')
}

export async function deleteApiKey(id: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('api_keys').delete().eq('id', id)
  revalidatePath('/admin/keys')
}
