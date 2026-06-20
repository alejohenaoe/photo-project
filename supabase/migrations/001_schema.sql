-- ============================================================
-- Migration 001: Core Schema
-- Photography Client Portal MVP
-- ============================================================

-- 0. Enums
-- ============================================================

create type user_role as enum ('photographer', 'client');
create type quote_status as enum ('new', 'read', 'archived');

-- 1. Profiles (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (new.id, 'client', '');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Clients
-- ============================================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 3. Access Codes
-- ============================================================

create table access_codes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz,
  is_active boolean not null default true,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_access_codes_client on access_codes(client_id);
create index idx_access_codes_active on access_codes(is_active) where is_active = true;

-- 4. Galleries
-- ============================================================

create table galleries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 5. Photos
-- ============================================================

create table photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references galleries(id) on delete cascade,
  filename text not null,
  storage_path text not null,          -- R2 path for original
  preview_path text not null,           -- R2 path for preview
  size integer not null default 0,
  width integer,
  height integer,
  mime_type text not null default 'image/jpeg',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_photos_gallery on photos(gallery_id);
create index idx_photos_sort on photos(gallery_id, sort_order);

-- 6. Photo Permissions
-- ============================================================

create table photo_permissions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(photo_id, client_id)
);

create index idx_photo_permissions_client on photo_permissions(client_id);
create index idx_photo_permissions_photo on photo_permissions(photo_id);

-- 7. Download Logs
-- ============================================================

create table download_logs (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

create index idx_download_logs_client on download_logs(client_id);
create index idx_download_logs_date on download_logs(downloaded_at desc);

-- 8. Quote Requests
-- ============================================================

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_type text,
  session_type text,
  event_date date,
  location text,
  duration text,
  budget text,
  notes text,
  status quote_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table clients enable row level security;
alter table access_codes enable row level security;
alter table galleries enable row level security;
alter table photos enable row level security;
alter table photo_permissions enable row level security;
alter table download_logs enable row level security;
alter table quote_requests enable row level security;

-- Helper: check if the current user is the photographer
-- (single photographer system — the first user with role = 'photographer')
create function public.is_photographer()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'photographer'
  );
$$;

-- Helper: check if client has access to a gallery (via photo_permissions)
create function public.client_has_gallery_access(gallery_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from clients c
    join photo_permissions pp on pp.client_id = c.id
    join photos p on p.id = pp.photo_id
    where c.profile_id = auth.uid()
      and p.gallery_id = gallery_id
      and pp.is_active = true
  );
$$;

-- Profiles RLS
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid() or is_photographer());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Photographer can update any profile"
  on profiles for update
  using (is_photographer());

-- Clients RLS
create policy "Photographer manages clients"
  on clients for all
  using (is_photographer());

-- Access Codes RLS
create policy "Photographer manages access codes"
  on access_codes for all
  using (is_photographer());

-- Galleries RLS
create policy "Photographer manages galleries"
  on galleries for all
  using (is_photographer());

create policy "Clients can view accessible galleries"
  on galleries for select
  using (
    is_photographer()
    or (auth.role() = 'authenticated' and client_has_gallery_access(id))
  );

-- Photos RLS
create policy "Photographer manages photos"
  on photos for all
  using (is_photographer());

create policy "Clients can view photos in accessible galleries"
  on photos for select
  using (
    is_photographer()
    or (auth.role() = 'authenticated' and client_has_gallery_access(gallery_id))
  );

-- Photo Permissions RLS
create policy "Photographer manages photo permissions"
  on photo_permissions for all
  using (is_photographer());

-- Download Logs RLS
create policy "Photographer views download logs"
  on download_logs for all
  using (is_photographer());

create policy "Edge Function inserts download logs"
  on download_logs for insert
  with check (true);  -- service role used by Edge Functions

-- Quote Requests RLS
create policy "Anyone can submit quote requests"
  on quote_requests for insert
  with check (true);

create policy "Photographer manages quote requests"
  on quote_requests for all
  using (is_photographer());

-- ============================================================
-- Updated_at trigger helper
-- ============================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

create trigger set_clients_updated_at
  before update on clients
  for each row execute function public.set_updated_at();

create trigger set_galleries_updated_at
  before update on galleries
  for each row execute function public.set_updated_at();
