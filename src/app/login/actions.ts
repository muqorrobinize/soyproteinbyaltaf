'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=Email+dan+password+wajib+diisi')
  }

  if (password.length < 6) {
    redirect('/login?error=Password+minimal+6+karakter')
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Email already registered
  if (data?.user?.identities?.length === 0) {
    redirect('/login?error=Email+sudah+terdaftar.+Silakan+Sign+In.')
  }

  // Email confirmation required (disabled → session immediately available)
  if (data?.user && !data.session) {
    // Confirmation needed — create user row manually so profile exists
    if (data.user.id) {
      try {
        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        await supabaseAdmin.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
        }, { onConflict: 'id', ignoreDuplicates: true })
      } catch { /* ignore */ }
    }
    redirect('/login?error=Cek+email+kamu+untuk+konfirmasi,+lalu+Sign+In')
  }

  // Auto-create user profile if trigger hasn't run yet (race condition safety)
  if (data?.user?.id) {
    try {
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabaseAdmin.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
      }, { onConflict: 'id', ignoreDuplicates: true })
    } catch { /* ignore, trigger handles it */ }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
