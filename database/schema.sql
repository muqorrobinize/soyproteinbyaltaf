-- ============================================
-- SoyProtein by Altaf - Complete Database Setup
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE (linked to Supabase Auth)
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
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 2. AUTO-CREATE USER PROFILE ON SIGNUP
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
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. API KEYS TABLE (for multi-provider AI key rotation)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'openai',
  name text NOT NULL DEFAULT 'Default Key',
  key_value text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DONE! All tables are ready.
-- Now go back to your app and login.
-- ============================================
