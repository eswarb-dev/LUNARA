-- Lunara Default Audio Playlist Migration
-- Run this in Supabase SQL Editor after migration_user_audio_library.sql

-- ============================================================
-- 1. STORAGE BUCKET: lunara-default-audio (PUBLIC)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lunara-default-audio', 'lunara-default-audio', true)
on conflict (id) do update
set public = true;

-- ============================================================
-- 2. DEFAULT AUDIO TRACKS TABLE
-- ============================================================
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

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table public.default_audio_tracks enable row level security;

drop policy if exists "Anyone can view active default audio tracks" on public.default_audio_tracks;

create policy "Anyone can view active default audio tracks"
on public.default_audio_tracks
for select
to anon, authenticated
using (is_active = true);

-- ============================================================
-- 4. DEFAULT TRACK METADATA
-- ============================================================
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
