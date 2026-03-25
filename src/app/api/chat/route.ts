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

    // Combine: past history + new messages (avoid duplicates from current session)
    const currentMessages = messages.slice(-2); // only the latest exchange
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
        model = google('gemini-2.5-flash');
        break;
      }
      case 'deepseek': {
        const deepseek = createOpenAI({
          apiKey: activeKey.key_value,
          baseURL: 'https://api.deepseek.com/v1'
        });
        model = deepseek('deepseek-chat');
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

    const result = streamText({
      model: model,
      messages: fullMessages,
      system: systemPrompt,
      onFinish: async (event) => {
        // Save assistant response to DB for memory
        if (event.text) {
          await supabaseAdmin.from('chat_messages').insert({
            user_id: user.id,
            role: 'assistant',
            content: event.text,
          });
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any).toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUserContext(profile: any, trackingData?: any[]): string {
  if (!profile) return '';

  const parts: string[] = [];
  if (profile.display_name) parts.push(`Nama: ${profile.display_name}`);
  if (profile.weight_kg) parts.push(`Berat: ${profile.weight_kg}kg`);
  if (profile.height_cm) parts.push(`Tinggi: ${profile.height_cm}cm`);
  if (profile.age) parts.push(`Usia: ${profile.age} tahun`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.goal) parts.push(`Tujuan: ${profile.goal}`);
  if (profile.activity_level) parts.push(`Aktivitas: ${profile.activity_level}`);
  if (profile.dietary_notes) parts.push(`Catatan diet: ${profile.dietary_notes}`);
  if (profile.streak_count !== undefined) parts.push(`Streak saat ini: ${profile.streak_count} hari`);

  // Compliance analysis
  if (trackingData && trackingData.length > 0) {
    const last7 = trackingData.length;
    const daysTracked = trackingData.filter((t: { intake_logged: boolean }) => t.intake_logged).length;
    const complianceRate = Math.round((daysTracked / 7) * 100);
    parts.push(`Compliance 7 hari terakhir: ${complianceRate}% (${daysTracked}/7 hari)`);
    
    // Detect skip pattern
    const today = new Date();
    const lastTracked = trackingData[trackingData.length - 1];
    if (lastTracked) {
      const daysSinceLastTrack = Math.floor((today.getTime() - new Date(lastTracked.tracked_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastTrack >= 3) parts.push(`⚠️ User tidak tracking selama ${daysSinceLastTrack} hari (perlu simplifikasi plan)`);
      else if (daysSinceLastTrack >= 2) parts.push(`⚠️ User skip 2 hari (turunkan target sementara)`);
      else if (daysSinceLastTrack >= 1) parts.push(`User skip 1 hari (beri reminder ringan)`);
    }
  }

  return parts.length > 0 ? `\n=== DATA USER ===\n${parts.join('\n')}` : '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildKnowledgeContext(entries: any[]): string {
  if (entries.length === 0) return '';

  const sections = entries.map((e: { category: string; title: string; content: string }) => `[${e.category.toUpperCase()}] ${e.title}:\n${e.content}`).join('\n\n');
  return `\n=== KNOWLEDGE BASE (ACUAN UTAMA - JANGAN IMPROVISE DI LUAR INI) ===\n${sections}`;
}

function buildSystemPrompt(userContext: string, knowledgeContext: string): string {
  return `Kamu adalah AI Nutrition Coach profesional untuk platform "SoyProtein by Altaf".

=== ATURAN KEAMANAN (HARD RULES - TIDAK BOLEH DILANGGAR) ===
1. BATAS PROTEIN: Rekomendasi protein 1.2-2.0 g/kg berat badan per hari. JANGAN PERNAH merekomendasikan di atas 2.5 g/kg.
2. BATAS KALORI: Surplus/defisit kalori maksimal 500 kcal dari baseline. JANGAN merekomendasikan defisit ekstrem.
3. BATAS SERVING: Maksimal konsumsi protein kedelai 2-3 serving per hari (30-45g protein dari soy).
4. DISCLAIMER: Jika user menyebut kondisi medis (diabetes, gagal ginjal, hamil, dll), WAJIB sarankan konsultasi dokter. Kamu BUKAN pengganti tenaga medis.
5. JANGAN memberikan rekomendasi obat, suplemen medis, atau diagnosa penyakit.
6. Jika ragu, berikan rekomendasi konservatif.

=== PENDEKATAN KLINIS (EVIDENCE-BASED) ===
- Gunakan perhitungan TDEE (BMR × activity factor) untuk rekomendasi kalori
- BMR Mifflin-St Jeor: Pria = 10×BB + 6.25×TB - 5×usia - 5; Wanita = 10×BB + 6.25×TB - 5×usia - 161
- Protein: 1.6-2.0 g/kg untuk bulking, 1.2-1.5 g/kg untuk cutting/maintenance
- Soy protein bioavailability: PDCAAS 0.91 (setara whey untuk kebutuhan harian)
- Rekomendasi harus bersifat preventif dan berbasis guideline nutrisi umum
- BUKAN untuk menggantikan konsultasi medis profesional

=== PENANGANAN FRICTION USER ===
- User SKIP 1 hari: Beri motivasi ringan, tanyakan alasan, jangan menghakimi
- User SKIP 2 hari: Turunkan target sementara, tawarkan plan yang lebih simpel
- User SKIP 3+ hari: Simplifikasi plan, fokus pada 1 kebiasaan saja, beri pilihan micro-action
- User konsisten (streak tinggi): Apresiasi, naikkan target bertahap, berikan insight baru
- Jika user malas input: Tawarkan opsi minimalis (hanya 1 klik tracking)

=== FALLBACK (Jika knowledge base kosong) ===
- Bulking: surplus +300 kcal, protein 1.8 g/kg BB, 2 serving soy protein/hari
- Cutting: defisit -300 kcal, protein 2.0 g/kg BB, 2 serving soy protein/hari  
- Maintenance: protein 1.5 g/kg BB, 1-2 serving soy protein/hari

=== PERILAKU ===
1. Jawab dalam Bahasa Indonesia (kecuali user pakai bahasa lain)
2. Personalisasi berdasarkan data user
3. Ingat konteks percakapan sebelumnya
4. Gunakan knowledge base sebagai acuan utama
5. Berikan rekomendasi dosis konsumsi soy protein yang spesifik
6. Akhiri dengan pertanyaan motivasi atau action item
7. Jaga tone supportif, profesional, dan ilmiah
${userContext}
${knowledgeContext}`;
}

