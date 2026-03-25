import React from 'react';

export default function AdminGuidePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-extrabold text-green-950 dark:text-green-50">Database & Deployment Guide</h2>
      
      <div className="glass-panel p-8 space-y-8 text-green-950 dark:text-green-50">
        
        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">1. Buat Project Supabase</h3>
          <p className="mb-2">Aplikasi ini membutuhkan Supabase sebagai backend database (PostgreSQL) dan sistem Autentikasi.</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Kunjungi <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase.com</a> dan buat project baru.</li>
            <li>Tunggu beberapa menit hingga database siap digunakan.</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">2. Jalankan Script SQL</h3>
          <p className="mb-2">Agar fitur Admin, Subscription, dan API Keys berfungsi, jalankan script ini di <strong>SQL Editor</strong> Supabase Anda:</p>
          <div className="bg-black/80 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto">
            <pre>{`-- 1. Create qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  code text primary key,
  duration integer not null default 7,
  status text not null default 'unused',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  code text references public.qr_codes(code) not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Add admin columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text not null default 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked boolean not null default false;

-- 4. Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid default gen_random_uuid() primary key,
  provider text not null default 'openai',
  name text not null default 'Default Key',
  key_value text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}</pre>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">3. Konfigurasi Kunci (API Keys) Lingkungan</h3>
          <p className="mb-2">Buka menu <strong>Project Settings -&gt; API</strong> di Supabase. Anda membutuhkan 3 kunci ini untuk dimasukkan ke file <code>.env.production</code> sebelum melakukan <i>push</i> ke GitHub:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Project URL</strong> (Untuk <code>NEXT_PUBLIC_SUPABASE_URL</code>)</li>
            <li><strong>anon / public key</strong> (Untuk <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)</li>
            <li><strong>service_role / secret key</strong> (Untuk <code>SUPABASE_SERVICE_ROLE_KEY</code>)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-green-200 dark:border-green-800 pb-2 mb-4">4. Pengaturan AI & Multi-Provider</h3>
          <p>Anda bisa mengatur API Key AI langsung di menu <strong>API Keys</strong> di panel Admin ini. Aplikasi mendukung:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li><strong>OpenAI</strong> (Model: gpt-4o-mini)</li>
            <li><strong>Anthropic</strong> (Model: claude-3-5-sonnet)</li>
            <li><strong>Google</strong> (Model: gemini-2.5-flash)</li>
            <li><strong>DeepSeek</strong> (Model: deepseek-chat)</li>
          </ul>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">Sistem akan otomatis merotasi kunci dari daftar kunci yang berstatus &apos;Active&apos;.</p>
        </section>

      </div>
    </div>
  );
}
