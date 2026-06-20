# Phase 3 — Authentication & Activation Flow

## Goal

Build the client access code activation flow and authentication system.

## Edge Functions

### `generate-access-code`
- **Endpoint**: `/functions/v1/generate-access-code`
- **Auth**: JWT required (photographer only — enforced by photographer role)
- **Input**: `{ clientId: string }`
- **Output**: `{ code: "381592" }`
- **Logic**: Generates random 6-digit number, stores SHA-256 hash in `access_codes` table, returns plain text code for email delivery

### `validate-code`
- **Endpoint**: `/functions/v1/validate-code`
- **Auth**: None (public — called during activation)
- **Input**: `{ code: "381592" }`
- **Output**: `{ valid: true, client: { name, email } }` or `{ valid: false, error }`
- **Logic**: Hashes the code, looks up in `access_codes`, checks expiry, returns client info

### `validate-and-activate`
- **Endpoint**: `/functions/v1/validate-and-activate`
- **Auth**: None (public — called during registration)
- **Input**: `{ code, email, password }`
- **Output**: `{ success: true, email }`
- **Logic**: Validates code, creates auth user via Supabase admin API, links profile to client, marks code as used

### `send-access-email`
- **Endpoint**: `/functions/v1/send-access-email`
- **Auth**: None (called from generate flow or directly)
- **Input**: `{ email, code, clientName }`
- **Output**: `{ sent: true }`
- **Logic**: Sends email with access code via Resend API

## Client Activation Flow

1. Photographer creates client → generates code → sends email
2. Client opens activation page `/activate`
3. Client enters 6-digit code → validated via `validate-code`
4. If valid: client sees registration form (email + password)
5. Client submits → `validate-and-activate` creates auth user + links profile
6. Client redirected to `/login`
7. Client signs in → redirected to `/client` (client) or `/admin` (photographer)

## Frontend Changes

### New files
- `src/hooks/useAuth.ts` — Auth state hook (session, role, login, logout)
- `src/pages/Activation.tsx` — Two-step activation screen

### Modified files
- `src/guards/AuthGuard.tsx` — Now checks role and redirects accordingly
- `src/routes/index.tsx` — Added `/activate` route, role-based guards
- `src/pages/Login.tsx` — Connected to Supabase Auth
- `src/layouts/AdminLayout.tsx` — Added logout button
- `src/layouts/ClientLayout.tsx` — Added logout button

## Route Protection

| Route | Access | Redirect if not |
|---|---|---|
| `/admin/*` | `photographer` only | `/login` |
| `/client/*` | `client` only | `/login` |
| `/login` | Public | — |
| `/activate` | Public | — |
| `/` and public | Public | — |

## Secrets

- `RESEND_API_KEY` — Set as Supabase Edge Function secret
