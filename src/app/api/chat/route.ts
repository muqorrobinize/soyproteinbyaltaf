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

    // 2. Get full user profile & verify subscription
    const { data: profile } = await supabase
      .from('users')
      .select('*')
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

    // 4. Fetch chat history for memory (last 30 messages)
    const { data: pastMessages } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(30);

    // 5. Fetch knowledge base
    const { data: knowledgeEntries } = await supabaseAdmin
      .from('knowledge_base')
      .select('title, content, category')
      .eq('is_active', true);

    // 5b. Fetch tracking data for compliance analysis
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: trackingData } = await supabaseAdmin
      .from('tracking')
      .select('tracked_date, intake_logged')
      .eq('user_id', user.id)
      .gte('tracked_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('tracked_date', { ascending: true });

    // 6. Build user context
    const userContext = buildUserContext(profile, trackingData || []);
    const knowledgeContext = buildKnowledgeContext(knowledgeEntries || []);

    // 7. Build full message history (memory + current)
    const historyMessages = (pastMessages || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Combine: past history + new messages
    const currentMessages = messages.slice(-2); 
    const fullMessages = [...historyMessages, ...currentMessages];

    // 8. Save the latest user message to DB
    const latestUserMsg = messages[messages.length - 1];
    if (latestUserMsg && latestUserMsg.role === 'user') {
      await supabaseAdmin.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: latestUserMsg.content,
      });
    }

    // 9. Setup AI model
    let model;
    
    switch (activeKey.provider.toLowerCase()) {
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey: activeKey.key_value });
        model = anthropic('claude-3-5-sonnet-20241022');
        break;
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey: activeKey.key_value });
        model = google('gemini-1.5-flash');
        break;
      }
      case 'openai':
      default: {
        const openai = createOpenAI({ apiKey: activeKey.key_value });
        model = openai('gpt-4o-mini');
        break;
      }
    }

    // 10. Call AI with full context
    const systemPrompt = buildSystemPrompt(userContext, knowledgeContext);

    const result = await streamText({
      model: model,
      messages: fullMessages,
      system: systemPrompt,
      onFinish: async (event) => {
        if (event.text) {
          await supabaseAdmin.from('chat_messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: event.text,
          });
        }
      },
    });

    return (result as any).toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function buildUserContext(profile: any, trackingData?: any[]): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.display_name) parts.push(`Nama: ${profile.display_name}`);
  if (profile.weight_kg) parts.push(`Berat: ${profile.weight_kg}kg`);
  if (profile.height_cm) parts.push(`Tinggi: ${profile.height_cm}cm`);
  if (profile.age) parts.push(`Usia: ${profile.age} tahun`);
  if (profile.goal) parts.push(`Tujuan: ${profile.goal}`);
  if (profile.activity_level) parts.push(`Aktivitas: ${profile.activity_level}`);
  if (profile.dietary_notes) parts.push(`Catatan diet / Memory: ${profile.dietary_notes}`);
  return parts.length > 0 ? `\n=== USER PROFILE (AI MEMORY) ===\n${parts.join('\n')}` : '';
}

function buildKnowledgeContext(entries: any[]): string {
  if (entries.length === 0) return '';
  const sections = entries.map((e: any) => `[${e.category}] ${e.title}:\n${e.content}`).join('\n\n');
  return `\n=== KNOWLEDGE BASE ===\n${sections}`;
}

function buildSystemPrompt(userContext: string, knowledgeContext: string): string {
  return `Kamu adalah AI Nutrition Coach profesional untuk platform "SoyProtein by Altaf".
 
 === PERSONALISASI (WAJIB) ===
 1. Gunakan nama user jika tersedia dalam percakapan.
 2. Selalu sesuaikan saran dengan data fisik user (BMI, Berat, Goal).
 3. Tunjukkan bahwa kamu "mengingat" mereka menggunakan data profil yang tersedia.
 
 === ATURAN KEAMANAN ===
 1. BATAS PROTEIN: Rekomendasi 1.2-2.0 g/kg per hari. JANGAN di atas 2.5 g/kg.
 2. DISCLAIMER: Jika user menyebut kondisi medis, WAJIB sarankan konsultasi dokter.
 3. Kamu BUKAN pengganti tenaga medis.
 
 === PERILAKU ===
 1. Jawab dalam Bahasa Indonesia.
 2. Berikan rekomendasi dosis soy protein yang spesifik (misal: 2 serving/hari).
 3. Tone supportif, profesional, dan ilmiah.
 
 ${userContext}
 ${knowledgeContext}`;
}
