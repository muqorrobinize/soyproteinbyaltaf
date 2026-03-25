'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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
    redirect('/login?error=Email+and+password+are+required')
  }

  if (password.length < 6) {
    redirect('/login?error=Password+must+be+at+least+6+characters')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmation is required, Supabase returns a user with identities = []
  if (data?.user?.identities?.length === 0) {
    redirect('/login?error=Account+already+exists.+Please+Sign+In+instead.')
  }

  // Check if email confirmation is needed
  if (data?.user && !data.session) {
    redirect('/login?error=Check+your+email+for+a+confirmation+link+then+Sign+In')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
