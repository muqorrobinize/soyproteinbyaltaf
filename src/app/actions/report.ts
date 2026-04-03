'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function getComprehensiveReportData(userId: string, targetUser: string, days: number) {
  // Ensure we have access (if not using service role, we use RLs). 
  // For the case of admin or user pulling data, we can use the service role if needed, 
  // but let's check auth first for security.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized');
  }

  // To allow Admins to pull other users' data, we use the service role key safely on the backend.
  const isAdmin = user.user_metadata?.role === 'admin' || false;
  // Fallback: If user asks for their own data, fine. If they ask for someone else's, check admin.
  if (user.id !== targetUser) {
    // Validate if caller is admin in real DB
    const { data: caller } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (caller?.role !== 'admin') {
      throw new Error('Forbidden: Only admins can access other users data');
    }
  }

  // Use service client for guaranteed fetching across RLS if caller is Admin
  const supabaseServer = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: targetProfile, error: userError } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', targetUser)
    .single()

  if (userError) throw userError;

  // Fetch tracking data for the past 'days'
  const filterDate = new Date();
  // Set to midnight UTC of the start date
  filterDate.setDate(filterDate.getDate() - days);
  const dateStr = filterDate.toISOString().split('T')[0];

  const { data: trackingHistory, error: trackError } = await supabaseServer
    .from('tracking')
    .select('*')
    .eq('user_id', targetUser)
    .gte('tracked_date', dateStr)
    .order('tracked_date', { ascending: true })

  if (trackError) throw trackError;

  return {
    profile: targetProfile,
    history: trackingHistory || [],
    generatedAt: new Date().toISOString()
  }
}

export async function addAdminConcern(targetUserId: string, concernNote: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized');

  const { data: caller } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') {
    throw new Error('Forbidden');
  }

  const supabaseServer = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Update the user's dietary_notes
  const { data: existingUser } = await supabaseServer.from('users').select('dietary_notes').eq('id', targetUserId).single()
  
  const separator = existingUser?.dietary_notes ? '\\n\\n--- ADMIN NOTE ---\\n' : '--- ADMIN NOTE ---\\n';
  const newNotes = (existingUser?.dietary_notes || '') + separator + concernNote;

  const { error } = await supabaseServer
    .from('users')
    .update({ dietary_notes: newNotes })
    .eq('id', targetUserId);

  if (error) throw error;
  return { success: true }
}
