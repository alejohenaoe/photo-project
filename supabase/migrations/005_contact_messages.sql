-- ============================================================
-- Migration 005: Contact Messages
-- Store contact form submissions in the database
-- ============================================================

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only the photographer can read/write
alter table contact_messages enable row level security;

create policy "Photographer can manage contact_messages"
  on contact_messages for all
  using (auth.uid() in (
    select id from profiles where role = 'photographer'
  ));
