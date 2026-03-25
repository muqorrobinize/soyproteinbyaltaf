import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Verify Subscription
    const { data: profile } = await supabase
      .from('users')
      .select('subscription_end, is_blocked')
      .eq('id', user.id)
      .single();

    if (profile?.is_blocked) {
      return new NextResponse('Account Blocked', { status: 403 });
    }

    const subscriptionEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null;
    const isActive = subscriptionEnd && subscriptionEnd > new Date();

    if (!isActive) {
      return new NextResponse('Payment Required: Active subscription needed', { status: 402 });
    }

    // 3. Fetch Active API Keys
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: keys } = await supabaseAdmin
      .from('api_keys')
      .select('provider, key_value')
      .eq('is_active', true);

    let activeKey = null;

    if (keys && keys.length > 0) {
      activeKey = keys[Math.floor(Math.random() * keys.length)];
    } else if (process.env.OPENAI_API_KEY) {
      activeKey = { provider: 'openai', key_value: process.env.OPENAI_API_KEY };
    }

    if (!activeKey) {
      console.error('No AI API key found in DB or ENV');
      return new NextResponse('Internal Server Error: AI Service Unavailable', { status: 500 });
    }

    let model;
    
    switch (activeKey.provider.toLowerCase()) {
      case 'anthropic':
        const anthropic = createAnthropic({ apiKey: activeKey.key_value });
        model = anthropic('claude-3-5-sonnet-20241022');
        break;
      case 'google':
        const google = createGoogleGenerativeAI({ apiKey: activeKey.key_value });
        model = google('gemini-2.5-flash');
        break;
      case 'deepseek':
        const deepseek = createOpenAI({
          apiKey: activeKey.key_value,
          baseURL: 'https://api.deepseek.com/v1'
        });
        model = deepseek('deepseek-chat');
        break;
      case 'openai':
      default:
        const openai = createOpenAI({ apiKey: activeKey.key_value });
        model = openai('gpt-4o-mini');
        break;
    }

    // 4. Call AI
    const result = streamText({
      model: model,
      messages,
      system: "You are an expert AI Nutrition Coach for the 'SoyProtein by Altaf' platform. You help users with their diet, bulking, and cutting goals based on their inputs. You focus on behavior change, compliance, and actionable daily feedback. Keep responses concise, supportive, and scientifically accurate. End your messages with a quick motivating question if applicable.",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any).toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
