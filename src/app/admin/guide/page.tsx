import React from 'react';

export default function AdminGuidePage() {
  const sqlScript = `-- ============================================
-- SoyProtein by Altaf - Complete Database Setup
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  subscription_end timestamp with time zone,
  role text NOT NULL DEFAULT 'user',
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. AUTO-CREATE USER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. QR CODES TABLE
CREATE TABLE IF NOT EXISTS public.qr_codes (
  code text PRIMARY KEY,
  duration integer NOT NULL DEFAULT 7,
  status text NOT NULL DEFAULT 'unused',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 4. REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  code text REFERENCES public.qr_codes(code) NOT NULL,
  redeemed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own redemptions"
  ON public.redemptions FOR SELECT USING (auth.uid() = user_id);

-- 5. API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'openai',
  name text NOT NULL DEFAULT 'Default Key',
  key_value text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- DONE! All tables are ready.`;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Setup Guide</h2>
      
      <div className="glass-panel p-8 space-y-8 text-green-950 dark:text-green-50">
        
        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">1. Buat Project Supabase</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Kunjungi <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase.com</a> dan buat project baru.</li>
            <li>Tunggu hingga database siap digunakan.</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">2. Jalankan SQL (WAJIB)</h3>
          <p className="mb-2">Copy <strong>seluruh</strong> script di bawah ini, buka <strong>SQL Editor</strong> di Supabase, paste, dan klik <strong>Run</strong>.</p>
          <p className="mb-3 text-sm text-orange-600 dark:text-orange-400 font-bold">⚠️ Script ini membuat: tabel users + trigger auto-create, qr_codes, redemptions, api_keys, dan RLS policies.</p>
          <div className="bg-black/80 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <pre>{sqlScript}</pre>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">3. Matikan Email Confirmation</h3>
          <p className="mb-2">Agar user bisa langsung login tanpa verifikasi email:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Buka <strong>Authentication</strong> di sidebar Supabase</li>
            <li>Klik <strong>Providers</strong> → <strong>Email</strong></li>
            <li><strong>Matikan</strong> toggle <strong>Confirm email</strong></li>
            <li>Klik <strong>Save</strong></li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">4. Set Environment Variable di Vercel</h3>
          <p className="mb-2">Tambahkan <strong>1 variabel</strong> ini di Vercel Dashboard → Settings → Environment Variables:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><code className="bg-black/20 dark:bg-black/40 px-2 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> = secret key dari Supabase (Project Settings → API)</li>
          </ul>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">Variabel lain (URL dan publishable key) sudah ter-set otomatis di dalam kode.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">5. AI Multi-Provider</h3>
          <p>Kelola API Key AI di menu <strong>API Keys</strong>. Provider yang didukung:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li><strong>OpenAI</strong> (gpt-4o-mini)</li>
            <li><strong>Anthropic</strong> (claude-3-5-sonnet)</li>
            <li><strong>Google</strong> (gemini-2.5-flash)</li>
            <li><strong>DeepSeek</strong> (deepseek-chat)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">6. Alur Sistem</h3>
          <div className="bg-black/10 dark:bg-black/30 p-4 rounded-xl text-sm font-mono">
            <p>User scan QR → Login/Register → Redeem Code → Subscription aktif → AI Coach tersedia</p>
            <p className="mt-2 text-green-700 dark:text-green-300">• Redeem menambah durasi (bukan reset)</p>
            <p className="text-green-700 dark:text-green-300">• Data dan history AI tetap tersimpan</p>
            <p className="text-green-700 dark:text-green-300">• Subscription habis → AI terkunci, data tetap ada</p>
          </div>
        </section>

      </div>
    </div>
  );
}
