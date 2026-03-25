-- Users and profiles are usually handled by Supabase Auth (auth.users).
-- We create a public.users table that references auth.users to store additional info like subscription_end.

create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  subscription_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies for public.users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table for QR Codes
create table public.qr_codes (
  code text primary key,
  duration integer not null default 7, -- duration in days
  status text not null default 'unused', -- 'unused', 'used'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for QR Codes
-- Only service_role (backend server) can freely access qr_codes. So we don't grant public policies.
alter table public.qr_codes enable row level security;

-- Table for Redemptions
create table public.redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  code text references public.qr_codes(code) not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Redemptions
alter table public.redemptions enable row level security;
create policy "Users can view their own redemptions" on public.redemptions
  for select using (auth.uid() = user_id);

-- Insert dummy data into QR Codes
insert into public.qr_codes (code, duration, status) values
  ('TRIAL7', 7, 'unused'),
  ('PRO30', 30, 'unused');
