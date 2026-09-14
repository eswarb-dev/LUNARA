-- Lunara Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  bio text,
  avatar_url text,
  profile_image_url text,
  accent_color text default '#e8b4b8',
  language text default 'English',
  daily_reminder boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. DIARY ENTRIES TABLE
-- ============================================================
create table if not exists public.diary_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  date timestamptz not null default now(),
  mood text,
  mood_score integer,
  sentiment text,
  mood_tags text[] default '{}',
  emotion_tags text[] default '{}',
  life_balance_tags text[] default '{}',
  is_public boolean default false,
  image_url text,
  image_headline text,
  image_caption text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. MOOD LOGS TABLE (quick mood tracking)
-- ============================================================
create table if not exists public.mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  mood text not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
create index if not exists idx_diary_entries_user_id on public.diary_entries(user_id);
create index if not exists idx_diary_entries_date on public.diary_entries(date desc);
create index if not exists idx_diary_entries_mood on public.diary_entries(mood);
create index if not exists idx_mood_logs_user_id on public.mood_logs(user_id);
create index if not exists idx_mood_logs_date on public.mood_logs(date desc);

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger diary_entries_updated_at
  before update on public.diary_entries
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.diary_entries enable row level security;
alter table public.mood_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Diary entries policies
create policy "Users can view own entries"
  on public.diary_entries for select
  using (auth.uid() = user_id);

create policy "Users can view public entries"
  on public.diary_entries for select
  using (is_public = true);

create policy "Users can insert own entries"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.diary_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.diary_entries for delete
  using (auth.uid() = user_id);

-- Mood logs policies
create policy "Users can view own mood logs"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own mood logs"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mood logs"
  on public.mood_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own mood logs"
  on public.mood_logs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. STORAGE BUCKETS & POLICIES
-- ============================================================
-- Create buckets via Supabase Dashboard > Storage:
--   1. "avatars" - public bucket for profile images
--   2. "diary-images" - PRIVATE bucket for diary entry images

-- Storage policies (run in SQL Editor after creating buckets):

-- Avatars bucket policies
create policy "Authenticated users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Authenticated users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Diary images bucket policies
create policy "Authenticated users can upload own diary images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Private: only owner can SELECT directly; shared users access via signed URLs
create policy "Owner can view own diary images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Shared users can SELECT images for diaries shared with them
create policy "Shared user can view shared diary images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'diary-images'
    and exists (
      select 1
      from public.diary_shares ds
      join public.diary_entries de on de.id = ds.diary_id
      where ds.shared_with_user_id = auth.uid()
        and de.user_id::text = (storage.foldername(name))[1]
        and de.id::text = (storage.foldername(name))[2]
    )
  );

create policy "Authenticated users can update own diary images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can delete own diary images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 9. DEFAULT AUDIO PLAYLIST
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lunara-default-audio', 'lunara-default-audio', true)
on conflict (id) do update
set public = true;

create table if not exists public.default_audio_tracks (
  id text primary key,
  title text not null,
  mood_label text not null,
  bucket_id text not null default 'lunara-default-audio',
  storage_path text not null,
  content_type text default 'audio/mpeg',
  duration_seconds numeric,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.default_audio_tracks enable row level security;

drop policy if exists "Anyone can view active default audio tracks" on public.default_audio_tracks;

create policy "Anyone can view active default audio tracks"
on public.default_audio_tracks
for select
to anon, authenticated
using (is_active = true);

insert into public.default_audio_tracks (
  id,
  title,
  mood_label,
  bucket_id,
  storage_path,
  content_type,
  sort_order,
  is_active
)
values
  (
    'default-moonlit-lofi',
    'Moonlit Lofi',
    'Soft focus',
    'lunara-default-audio',
    'Lofi Beats with Sailor Moon.mp3',
    'audio/mpeg',
    0,
    true
  )
on conflict (id) do update
set
  title = excluded.title,
  mood_label = excluded.mood_label,
  bucket_id = excluded.bucket_id,
  storage_path = excluded.storage_path,
  content_type = excluded.content_type,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

update public.default_audio_tracks
set is_active = false,
    updated_at = now()
where id = 'default-rain-midnight';
