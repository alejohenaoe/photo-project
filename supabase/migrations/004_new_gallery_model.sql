-- Migration 004: New Gallery-Client model with download quotas
-- Replaces photo-by-photo permissions with gallery-level assignment

-- 1. Add new columns to galleries
alter table galleries add column client_id uuid references clients(id);
alter table galleries add column download_limit integer not null default 0;
alter table galleries add column download_count integer not null default 0;

create index idx_galleries_client on galleries(client_id);

-- 2. Remove old photo-level permissions system
drop table photo_permissions;

-- 3. Drop policies that depend on old helper function
drop policy if exists "Clients can view accessible galleries" on galleries;
drop policy if exists "Clients can view photos in accessible galleries" on photos;

-- 4. Drop old helper function
drop function public.client_has_gallery_access(uuid);

-- 5. Recreate is_photographer with security definer to avoid RLS recursion
create or replace function public.is_photographer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'photographer'
  );
$$;

-- 6. New helper: check if client owns this gallery (security definer to avoid RLS recursion)
create function public.client_owns_gallery(gallery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from galleries g
    join clients c on c.id = g.client_id
    where g.id = gallery_id
      and c.profile_id = auth.uid()
  );
$$;

-- 7. Gallery RLS
create policy "Clients can view own galleries"
  on galleries for select
  using (is_photographer() or client_owns_gallery(id));

-- 8. Photos RLS
create policy "Clients can view photos in own galleries"
  on photos for select
  using (is_photographer() or client_owns_gallery(gallery_id));

-- 9. Client self-service: allows clients to read their own client record
-- without triggering is_photographer() which previously caused recursion
create policy "Clients can view own client record"
  on clients for select
  using (profile_id = auth.uid());
