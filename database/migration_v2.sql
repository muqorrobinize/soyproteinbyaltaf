-- ================================================================
-- SoyProtein by Altaf — COMPLETE MIGRATION SCRIPT
-- Run this ONCE in Supabase SQL Editor
-- Project: kklvtfuvxudckuxkoysc
-- ================================================================

-- ==== STEP 1: Add missing columns to existing users table ====
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goal text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activity_level text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_notes text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_tracked_date date;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_end timestamp with time zone;

-- ==== STEP 2: Fix existing users — set muqorroben as admin ====
UPDATE public.users SET role = 'admin', onboarding_complete = true
WHERE email = 'muqorroben@gmail.com';

-- ==== STEP 3: RLS policies for users ====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ==== STEP 4: Auto-create user row on signup (with ON CONFLICT safety) ====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==== STEP 5: Create chat_messages table (AI Memory) ====
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Users can view their own messages') THEN
    CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Users can insert their own messages') THEN
    CREATE POLICY "Users can insert their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==== STEP 6: Create knowledge_base table ====
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- ==== STEP 7: Create tracking table (Daily Intake) ====
CREATE TABLE IF NOT EXISTS public.tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tracked_date date NOT NULL DEFAULT CURRENT_DATE,
  intake_logged boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tracked_date)
);
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tracking' AND policyname='Users can view their own tracking') THEN
    CREATE POLICY "Users can view their own tracking" ON public.tracking FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tracking' AND policyname='Users can insert their own tracking') THEN
    CREATE POLICY "Users can insert their own tracking" ON public.tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==== STEP 8: Grant existing users unlimited access (for testing) ====
-- Remove this line when going live
UPDATE public.users SET subscription_end = NOW() + INTERVAL '365 days'
WHERE subscription_end IS NULL OR subscription_end < NOW();

-- ================================================================
-- DONE! All 8 tables ready. Verify with:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- ================================================================
