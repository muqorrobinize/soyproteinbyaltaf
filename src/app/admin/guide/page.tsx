import React from 'react';

export default function AdminGuidePage() {
  const sqlScript = `-- ============================================
-- NutriSoy by Altaf - Complete Database Setup
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  subscription_end timestamp with time zone,
  role text NOT NULL DEFAULT 'user',
  is_blocked boolean NOT NULL DEFAULT false,
  display_name text,
  weight_kg numeric,
  height_cm numeric,
  age integer,
  gender text,
  goal text,
  activity_level text,
  dietary_notes text,
  onboarding_complete boolean NOT NULL DEFAULT false,
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
  INSERT INTO public.users (id, email) VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. QR CODES
CREATE TABLE IF NOT EXISTS public.qr_codes (
  code text PRIMARY KEY,
  duration integer NOT NULL DEFAULT 7,
  status text NOT NULL DEFAULT 'unused',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 4. REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  code text REFERENCES public.qr_codes(code) NOT NULL,
  redeemed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own redemptions"
  ON public.redemptions FOR SELECT USING (auth.uid() = user_id);

-- 5. API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'openai',
  name text NOT NULL DEFAULT 'Default Key',
  key_value text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 6. CHAT MESSAGES (AI Memory)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- DONE!`;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Setup Guide</h2>
      
      <div className="glass-panel p-6 sm:p-8 space-y-8 text-green-950 dark:text-green-50">
        
        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">1. Buat Project Supabase</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
            <li>Kunjungi <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Supabase.com</a> dan buat project baru</li>
            <li>Tunggu hingga database siap</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">2. Jalankan SQL (WAJIB)</h3>
          <p className="mb-2 text-sm">Copy <strong>seluruh</strong> script di bawah, buka <strong>SQL Editor</strong> di Supabase, paste, klik <strong>Run</strong>.</p>
          <p className="mb-3 text-sm text-orange-600 dark:text-orange-400 font-bold">⚠️ Script ini membuat 7 tabel: users, qr_codes, redemptions, api_keys, chat_messages, knowledge_base + trigger auto-create user.</p>
          <div className="bg-black/90 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-80 overflow-y-auto">
            <pre>{sqlScript}</pre>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">3. Matikan Email Confirmation</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
            <li>Buka <strong>Authentication</strong> di sidebar Supabase</li>
            <li>Klik <strong>Providers</strong> → <strong>Email</strong></li>
            <li><strong>Matikan</strong> toggle <strong>Confirm email</strong></li>
            <li>Klik <strong>Save</strong></li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">4. Set Environment Variable di Vercel</h3>
          <p className="mb-2 text-sm">Buka Vercel Dashboard → Settings → Environment Variables:</p>
          <div className="bg-black/10 dark:bg-black/30 p-4 rounded-xl text-sm space-y-2">
            <p><code className="bg-black/20 dark:bg-black/40 px-2 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> = secret key dari Supabase</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">5. Setup AI</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
            <li>Buka menu <strong>API Keys</strong> di Admin Panel</li>
            <li>Tambahkan API key dari provider yang diinginkan (OpenAI, Anthropic, Google, DeepSeek)</li>
            <li>Buka menu <strong>Knowledge Base</strong> dan tambahkan informasi produk, nutrisi, dll</li>
            <li>AI Coach akan menggunakan knowledge base sebagai acuan utama</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">6. Alur Lengkap Sistem</h3>
          <div className="bg-black/10 dark:bg-black/30 p-4 rounded-xl text-sm font-mono space-y-2">
            <p className="font-bold text-green-700 dark:text-green-300">ADMIN FLOW:</p>
            <p>Login → Admin Panel → Generate QR (bulk/single) → Download gambar QR → Tempel ke kemasan produk</p>
            <p className="mt-3 font-bold text-green-700 dark:text-green-300">USER FLOW:</p>
            <p>Scan QR di kemasan → Otomatis buka web + auto-fill code → Login/Register → Redeem Code → Onboarding (isi profil) → AI Coach siap digunakan</p>
            <p className="mt-3 font-bold text-green-700 dark:text-green-300">AI MEMORY:</p>
            <p>• Profil user (berat, tinggi, tujuan) disimpan saat onboarding</p>
            <p>• Riwayat chat tersimpan di database (30 pesan terakhir)</p>
            <p>• Knowledge base admin menjadi acuan AI</p>
            <p>• Redeem menambah durasi (bukan reset progress/data)</p>
          </div>
        </section>

      </div>
    </div>
  );
}
