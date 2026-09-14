-- Lunara User Audio Library Migration
-- Run this in Supabase SQL Editor after migration_private_diaries.sql

-- ============================================================
-- 1. USER AUDIO TRACKS TABLE
-- ============================================================
create table if not exists public.user_audio_tracks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  mood text not null default '',
  storage_path text not null,
  duration_seconds integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
create index if not exists idx_user_audio_tracks_user_id on public.user_audio_tracks(user_id);

-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================
create trigger user_audio_tracks_updated_at
  before update on public.user_audio_tracks
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
alter table public.user_audio_tracks enable row level security;

-- Users can view their own tracks
create policy "Users can view own audio tracks"
  on public.user_audio_tracks for select
  using (auth.uid() = user_id);

-- Users can insert their own tracks
create policy "Users can insert own audio tracks"
  on public.user_audio_tracks for insert
  with check (auth.uid() = user_id);

-- Users can update their own tracks
create policy "Users can update own audio tracks"
  on public.user_audio_tracks for update
  using (auth.uid() = user_id);

-- Users can delete their own tracks
create policy "Users can delete own audio tracks"
  on public.user_audio_tracks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. STORAGE BUCKET: user-audio (PRIVATE)
-- ============================================================
-- Create the bucket via Supabase Dashboard > Storage:
--   Name: user-audio
--   Public: NO (unchecked)
--
-- Then run the following storage policies in SQL Editor:

-- Owner can upload
create policy "Authenticated users can upload own audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can view their own audio files
create policy "Owner can view own audio files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can update their own audio files
create policy "Authenticated users can update own audio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their own audio files
create policy "Authenticated users can delete own audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
