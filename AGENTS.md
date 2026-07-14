# Photo Project — Guía para el agente

## Despliegue (Deploy)

### Frontend (Vercel)
- El deploy se realiza automáticamente al hacer commit y push a `main` desde otra rama.
- Vercel detecta el push y despliega el build de Vite.

### Supabase (cloud)
- `supabase functions deploy <name>` — despliega una edge function a producción.
- `supabase db push` — aplica migrations pendientes al proyecto remoto.

### Regla de oro
**NUNCA se hace commit, push o deploy sin autorización explícita del usuario.** Esto aplica tanto para push a `main` (Vercel) como para despliegues a Supabase (functions y DB). Bajo ninguna circunstancia se asume permiso.

### Flujo de commit y push
1. **Antes de commitear**: hacer `git pull origin main` para verificar que la rama esté al día.
2. Hacer commit y push a la rama feature.
3. **Después de commitear y pushear**: volver a `main` con `git checkout main`.

## Comandos principales

| Comando | Descripción |
|---|---|
| `npm run dev` | Frontend dev server (hot reload, http://localhost:5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run lint` | ESLint |

## Supabase local

| Comando | Descripción |
|---|---|
| `supabase start` | Inicia todos los servicios locales (DB, Studio, Edge Functions) |
| `supabase status` | Muestra URLs y claves actuales |
| `supabase stop` | Detiene servicios (con `--no-backup` borra datos) |
| `supabase migration up` | Aplica migrations pendientes **sin borrar datos** |
| `supabase db reset` | Ejecuta todas las migrations desde 0 + seed **borra todos los datos** |
| `supabase functions deploy <name> --local` | Sirve edge function localmente |
| `supabase functions deploy <name>` | Despliega edge function a producción |

### Flujo diario recomendado

1. `supabase start` (si no está corriendo)
2. `npm run dev` (frontend)
3. Para cambios de DB: `supabase migration up` (preserva datos)
4. Para cambios en edge functions: editar y el CLI sirve automáticamente en local

### URLs locales

| Servicio | URL |
|---|---|
| Supabase Studio | http://127.0.0.1:54323 |
| REST API | http://127.0.0.1:54321/rest/v1 |
| Edge Functions | http://127.0.0.1:54321/functions/v1 |
| Supabase MCP | http://127.0.0.1:54321/mcp |

### Edge Functions en producción

- Se despliegan con `supabase functions deploy <name>`
- Secrets: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_ORIGINALS`, `R2_BUCKET_PREVIEWS`, `RESEND_API_KEY`
- Las funciones públicas (`validate-code`, `validate-and-activate`) NO deben tener `verify_jwt`
- Las funciones internas deben tener JWT y usar `SUPABASE_SERVICE_ROLE_KEY`

## Proyecto

- Vite + React + TypeScript + Tailwind CSS + React Router + TanStack Query
- Supabase Auth + RLS (single photographer, múltiples clients)
- R2 (Cloudflare) para almacenamiento de fotos
- Sin testing configurado aún

## Migraciones

- Las migrations están en `supabase/migrations/` con prefijo numérico
- Usar `supabase db reset` solo cuando no importen los datos locales
- Usar `supabase migration up` para cambios incrementales preservando datos
