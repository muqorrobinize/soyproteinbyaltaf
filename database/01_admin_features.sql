-- Run this SQL in your Supabase SQL Editor to add Admin Features

-- 1. Add role and is_blocked to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text not null default 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked boolean not null default false;

-- 2. Create api_keys table for multi-API key rotation
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid default gen_random_uuid() primary key,
  provider text not null default 'openai', -- e.g., 'openai', 'anthropic'
  name text not null default 'Default Key',
  key_value text not null,
  is_active boolean not null default true,
  last_checked_tier text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
-- Only service_role can access api_keys directly (so Admin backend routes can manage them).
