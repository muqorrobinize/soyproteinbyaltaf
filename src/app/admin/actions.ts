'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (user.email === 'muqorroben@gmail.com') return true;
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

function getAdminClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// ============ USER ACTIONS ============

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('users').update({ is_blocked: isBlocked }).eq('id', userId)
  revalidatePath('/admin/users')
}

export async function makeUserAdmin(userId: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('users').update({ role: 'admin' }).eq('id', userId)
  revalidatePath('/admin/users')
}

export async function adjustSubscription(userId: string, days: number) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const supabaseAdmin = getAdminClient()
  const { data: user } = await supabaseAdmin.from('users').select('subscription_end').eq('id', userId).single()

  let baseDate = new Date()
  if (user?.subscription_end) {
    const existingEnd = new Date(user.subscription_end)
    if (existingEnd > baseDate) baseDate = existingEnd
  }

  const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

  if (newEnd < new Date()) {
    await supabaseAdmin.from('users').update({ subscription_end: null }).eq('id', userId)
  } else {
    await supabaseAdmin.from('users').update({ subscription_end: newEnd.toISOString() }).eq('id', userId)
  }
  revalidatePath('/admin/users')
}

// ============ QR ACTIONS ============

export async function generateQrCode(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const code = formData.get('code') as string
  const duration = parseInt(formData.get('duration') as string)
  if (!code || !duration) throw new Error('Invalid input')
  await getAdminClient().from('qr_codes').insert({ code: code.toUpperCase(), duration, status: 'unused' })
  revalidatePath('/admin/qr')
}

export async function bulkGenerateQrCodes(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const prefix = (formData.get('prefix') as string || 'SP').toUpperCase()
  const count = parseInt(formData.get('count') as string)
  const duration = parseInt(formData.get('duration') as string)
  if (!count || count < 1 || count > 500 || !duration) throw new Error('Invalid input')

  const codes: { code: string; duration: number; status: string }[] = []
  for (let i = 0; i < count; i++) {
    const hash = crypto.randomBytes(6).toString('hex').toUpperCase()
    codes.push({ code: `${prefix}-${hash}`, duration, status: 'unused' })
  }

  await getAdminClient().from('qr_codes').insert(codes)
  revalidatePath('/admin/qr')
  return codes.map(c => c.code)
}

export async function deleteQrCode(code: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('qr_codes').delete().eq('code', code)
  revalidatePath('/admin/qr')
}

// ============ API KEY ACTIONS ============

export async function addApiKey(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const provider = formData.get('provider') as string || 'openai'
  const name = formData.get('name') as string
  const key_value = formData.get('key_value') as string
  if (!name || !key_value) throw new Error('Invalid input')
  await getAdminClient().from('api_keys').insert({ provider, name, key_value, is_active: true })
  revalidatePath('/admin/keys')
}

export async function toggleApiKey(id: string, isActive: boolean) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('api_keys').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/keys')
}

export async function deleteApiKey(id: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('api_keys').delete().eq('id', id)
  revalidatePath('/admin/keys')
}

// ============ KNOWLEDGE BASE ACTIONS ============

export async function addKnowledge(formData: FormData) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string || 'general'
  if (!title || !content) throw new Error('Invalid input')
  await getAdminClient().from('knowledge_base').insert({ title, content, category, is_active: true })
  revalidatePath('/admin/knowledge')
}

export async function toggleKnowledge(id: string, isActive: boolean) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('knowledge_base').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/knowledge')
}

export async function deleteKnowledge(id: string) {
  if (!(await verifyAdmin())) throw new Error('Unauthorized')
  await getAdminClient().from('knowledge_base').delete().eq('id', id)
  revalidatePath('/admin/knowledge')
}

// ============ API TIER CHECKER ============

export async function checkApiTier(keyId: string) {
  if (!(await verifyAdmin())) return { tier: 'Unauthorized', message: 'You must be an admin' }
  const supabaseAdmin = getAdminClient()
  
  const { data: keyRecord } = await supabaseAdmin.from('api_keys').select('*').eq('id', keyId).single()
  if (!keyRecord) return { tier: 'Unknown', message: 'Key not found' }
  if (keyRecord.provider !== 'openai') return { tier: 'N/A', message: 'Checking tier is only supported for OpenAI keys' }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyRecord.key_value}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 1
      })
    })

    const limitHeader = res.headers.get('x-ratelimit-limit-requests')
    
    if (!res.ok) {
      const err = await res.json()
      let tierStr = 'Error'
      if (err.error?.code === 'insufficient_quota') tierStr = 'Depleted / Free'
      else if (err.error?.code === 'invalid_api_key') tierStr = 'Invalid'
      
      await supabaseAdmin.from('api_keys').update({ last_checked_tier: tierStr }).eq('id', keyId)
      return { tier: tierStr, message: err.error?.message || 'API request failed' }
    }

    if (limitHeader) {
      const limit = parseInt(limitHeader, 10)
      const tierStr = limit <= 200 ? 'Free Tier' : 'Paid Tier'
      await supabaseAdmin.from('api_keys').update({ last_checked_tier: tierStr }).eq('id', keyId)
      revalidatePath('/admin/keys')
      return { tier: tierStr, message: `RPM Limit: ${limit}${limit > 200 ? ' (Tier 1+)' : ''}` }
    }
    
    await supabaseAdmin.from('api_keys').update({ last_checked_tier: 'Unknown' }).eq('id', keyId)
    revalidatePath('/admin/keys')
    return { tier: 'Unknown', message: 'Could not determine tier from headers' }

  } catch (error: any) {
    return { tier: 'Error', message: error.message }
  }
}
