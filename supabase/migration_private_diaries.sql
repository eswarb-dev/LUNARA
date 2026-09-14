-- Lunara Migration: Private Diaries + Sharing
-- Run this in the Supabase SQL Editor after the base schema
-- Safely rerunnable: all CREATE POLICY statements have matching DROP POLICY IF EXISTS

-- ============================================================
-- 0. SET DIARY-IMAGES BUCKET TO PRIVATE
-- ============================================================
update storage.buckets
set public = false
where id = 'diary-images' and public = true;

-- ============================================================
-- 1. ADD lunara_user_id TO PROFILES
-- ============================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'lunara_user_id'
  ) then
    alter table public.profiles add column lunara_user_id text unique;
  end if;
end $$;

-- ============================================================
-- 1b. ADD description TO diary_entries
-- ============================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'diary_entries' and column_name = 'description'
  ) then
    alter table public.diary_entries add column description text;
  end if;
end $$;

-- ============================================================
-- 2. GENERATE LUNARA USER ID FUNCTION
-- ============================================================
create or replace function public.generate_lunara_user_id()
returns text
language plpgsql
as $$
declare
  new_id text;
begin
  loop
    new_id := 'LUNA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1 from public.profiles where lunara_user_id = new_id
    );
  end loop;
  return new_id;
end;
$$;

-- ============================================================
-- 3. UPDATE HANDLE_NEW_USER TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, lunara_user_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    public.generate_lunara_user_id()
  );
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 4. BACKFILL EXISTING USERS WITHOUT lunara_user_id
-- ============================================================
update public.profiles
set lunara_user_id = public.generate_lunara_user_id()
where lunara_user_id is null;

-- ============================================================
-- 5. DIARY SHARES TABLE
-- ============================================================
create table if not exists public.diary_shares (
  id uuid primary key default uuid_generate_v4(),
  diary_id uuid not null references public.diary_entries(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null default 'read' check (permission in ('read', 'edit')),
  created_at timestamptz default now(),
  unique(diary_id, shared_with_user_id)
);

create index if not exists idx_diary_shares_diary_id on public.diary_shares(diary_id);
create index if not exists idx_diary_shares_shared_with on public.diary_shares(shared_with_user_id);
create index if not exists idx_diary_shares_owner on public.diary_shares(owner_id);

-- ============================================================
-- 6. DIARY SHARES RLS POLICIES
-- ============================================================
alter table public.diary_shares enable row level security;

-- Owner can manage shares for their own diaries
drop policy if exists "Owner can view shares for own diaries" on public.diary_shares;
create policy "Owner can view shares for own diaries"
  on public.diary_shares for select
  using (auth.uid() = owner_id);

drop policy if exists "Owner can create shares for own diaries" on public.diary_shares;
create policy "Owner can create shares for own diaries"
  on public.diary_shares for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owner can delete shares for own diaries" on public.diary_shares;
create policy "Owner can delete shares for own diaries"
  on public.diary_shares for delete
  using (auth.uid() = owner_id);

-- Shared user can view shares where they are the recipient
drop policy if exists "Shared user can view own shares" on public.diary_shares;
create policy "Shared user can view own shares"
  on public.diary_shares for select
  using (auth.uid() = shared_with_user_id);

-- ============================================================
-- 7. UPDATE DIARY_ENTRIES RLS FOR SHARED ACCESS
-- ============================================================
-- Remove the old public entries policy
drop policy if exists "Users can view public entries" on public.diary_entries;

-- Add policy: shared users can view diaries shared with them
drop policy if exists "Shared users can view shared diaries" on public.diary_entries;
create policy "Shared users can view shared diaries"
  on public.diary_entries for select
  using (
    exists (
      select 1 from public.diary_shares
      where diary_shares.diary_id = diary_entries.id
        and diary_shares.shared_with_user_id = auth.uid()
    )
  );

-- Add policy: shared users with edit permission can update
drop policy if exists "Shared users can edit shared diaries" on public.diary_entries;
create policy "Shared users can edit shared diaries"
  on public.diary_entries for update
  using (
    exists (
      select 1 from public.diary_shares
      where diary_shares.diary_id = diary_entries.id
        and diary_shares.shared_with_user_id = auth.uid()
        and diary_shares.permission = 'edit'
    )
  );

-- ============================================================
-- 8. STORAGE POLICIES (idempotent rerun)
-- ============================================================

-- Avatars bucket policies
drop policy if exists "Authenticated users can upload own avatar" on storage.objects;
create policy "Authenticated users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can update own avatar" on storage.objects;
create policy "Authenticated users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete own avatar" on storage.objects;
create policy "Authenticated users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Diary images bucket policies
drop policy if exists "Authenticated users can upload own diary images" on storage.objects;
create policy "Authenticated users can upload own diary images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Private: only owner can SELECT directly; shared users access via signed URLs
drop policy if exists "Anyone can view diary images" on storage.objects;
create policy "Owner can view own diary images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Shared users can SELECT images for diaries shared with them
drop policy if exists "Shared user can view shared diary images" on storage.objects;
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

drop policy if exists "Authenticated users can update own diary images" on storage.objects;
create policy "Authenticated users can update own diary images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete own diary images" on storage.objects;
create policy "Authenticated users can delete own diary images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'diary-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 9. FIND LUNARA PROFILE RPC FUNCTION
-- ============================================================
create or replace function public.find_lunara_profile(search_lunara_user_id text)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  lunara_user_id text,
  member_since timestamptz,
  diaries_shared_with_me integer,
  my_diaries_shared_with_them integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.lunara_user_id,
    p.created_at as member_since,

    (
      select count(*)::integer
      from public.diary_shares ds
      join public.diary_entries d
        on d.id = ds.diary_id
      where d.user_id = p.id
      and ds.shared_with_user_id = auth.uid()
    ) as diaries_shared_with_me,

    (
      select count(*)::integer
      from public.diary_shares ds
      join public.diary_entries d
        on d.id = ds.diary_id
      where d.user_id = auth.uid()
      and ds.shared_with_user_id = p.id
    ) as my_diaries_shared_with_them

  from public.profiles p
  where upper(p.lunara_user_id) = upper(trim(search_lunara_user_id))
  limit 1;
end;
$$;

grant execute on function public.find_lunara_profile(text) to authenticated;
