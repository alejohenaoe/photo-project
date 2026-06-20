# Phase 2 — Database Schema

## Goal

Design and implement the complete PostgreSQL schema with RLS policies.

## Migration file

`supabase/migrations/001_schema.sql`

## Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | Extends auth.users. Stores role (`photographer`/`client`) and name/phone. | Own profile + photographer sees all |
| `clients` | Clients created by the photographer. Linked to profile after activation. | Photographer only |
| `access_codes` | 6-digit codes stored hashed, per client. | Photographer only |
| `galleries` | Photo galleries. | Photographer CRUD, client select if has permissions |
| `photos` | Individual photos with R2 paths for original + preview. | Photographer CRUD, client select if gallery accessible |
| `photo_permissions` | Which photos each client can download. Unique(photo_id, client_id). | Photographer only |
| `download_logs` | Audit log for every download. | Edge Function inserts, photographer reads |
| `quote_requests` | Public form submissions. | Anyone inserts, photographer manages |

## Schema notes

- Single photographer — identified by `profiles.role = 'photographer'`
- Helper function `is_photographer()` used in all RLS policies
- Helper function `client_has_gallery_access(gallery_id)` for client gallery visibility
- Trigger `on_auth_user_created` auto-creates profile on signup
- Soft delete via `deleted_at` on clients, galleries, photos
- Updated_at trigger on profiles, clients, galleries

## RLS summary

- **Photographer**: full access to all tables
- **Client**: can only see their profile, galleries with assigned photos, and photo previews
- **Quote requests**: public insert, photographer-only read/manage
- **Download logs**: service role inserts (via Edge Function), photographer reads

## Deliverables

- [x] SQL migration (`supabase/migrations/001_schema.sql`)
- [x] RLS policies
- [x] Indexes on foreign keys and frequently queried columns
