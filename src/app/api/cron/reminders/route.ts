import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Vercel Cron endpoints should verify the authorization header
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find users whose subscription expires in exactly 1 day or 3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);
  const threeDaysStr = threeDays.toISOString().split('T')[0];

  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, subscription_end')
    .not('subscription_end', 'is', null);

  if (error || !users) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  const usersToRemind = users.filter((user) => {
    const end = new Date(user.subscription_end);
    const endStr = end.toISOString().split('T')[0];
    return endStr === tomorrowStr || endStr === threeDaysStr;
  });

  if (usersToRemind.length > 0 && process.env.MAKE_WEBHOOK_URL) {
    try {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'subscription_reminder',
          users: usersToRemind,
        }),
      });
    } catch (err) {
      console.error('Make.com webhook failed:', err);
    }
  }

  return NextResponse.json({ 
    success: true, 
    remindersSent: usersToRemind.length 
  });
}
