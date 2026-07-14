# Fase 5 (Rediseño) — Modelo de Galería por Cliente + Cupo de Descargas

## Motivación

Reemplazar el sistema de permisos foto-por-foto (`photo_permissions`) por un modelo donde cada galería pertenece a un solo cliente y el fotógrafo define un cupo máximo de descargas. El cliente elige qué fotos descargar hasta agotar su cupo.

## Arquitectura Nueva

### Base de Datos

```sql
-- Se elimina photo_permissions
-- Se agregan columnas a galleries:
--   client_id uuid REFERENCES clients(id)
--   download_limit integer NOT NULL DEFAULT 0  (0 = ilimitado)
--   download_count integer NOT NULL DEFAULT 0
```

### RLS

- Se elimina `client_has_gallery_access()`
- Se crea `client_owns_gallery()`: verifica que `galleries.client_id` apunte al `clients.profile_id = auth.uid()`
- Fotos: RLS usa `client_owns_gallery(gallery_id)` en lugar de pasar por `photo_permissions`

### Edge Functions

| Función | Cambio |
|---|---|
| `authorize-download` | **Eliminar** |
| `get-download-url` | **Modificar**: checar `gallery.client_id`, `download_count < download_limit`, incrementar `download_count` |
| `batch-get-download-urls` | **Nueva** (opcional): batch downloads con un solo incremento de `download_count` |

### Flujo Completo

1. Fotógrafo crea galería → asigna a un cliente + define cupo (ej: 10 fotos)
2. Cliente inicia sesión → ve la galería en su dashboard
3. Cliente entra a la galería → ve todas las fotos (previews)
4. Cliente descarga individualmente o selecciona varias y descarga en lote
5. Cada descarga incrementa `download_count`
6. Cuando `download_count >= download_limit` (y limit > 0):
   - Las fotos muestran badge "Inactiva/Descargada"
   - No se permite más descargas
   - La galería sigue visible pero con estado "Completada"

## Archivos Afectados

### Crear
- `supabase/migrations/004_new_gallery_model.sql`

### Eliminar
- `supabase/functions/authorize-download/`
- `src/pages/admin/galleries/Permissions.tsx`

### Modificar
- `supabase/functions/get-download-url/index.ts`
- `src/lib/api.ts`
- `src/hooks/useGalleries.ts`
- `src/routes/index.tsx`
- `src/pages/admin/galleries/Form.tsx`
- `src/pages/admin/galleries/Detail.tsx`
- `src/pages/admin/clients/Detail.tsx`
- `src/pages/client/Dashboard.tsx`
- `src/pages/client/GalleryView.tsx`

## Relación con Fases Existentes

| Fase | Relación |
|---|---|
| **Fase 4** (Gallery Management) | Extendida: formulario ahora incluye asignación de cliente y límite de descargas |
| **Fase 5** (Permisos) | **Reemplazada**: se elimina `photo_permissions` y el UI de permisos foto-por-foto |
| Fase 6 (Cotizaciones) | No afectada |
| Fase 7 (Producción) | No afectada |

## Notas

- `download_limit = 0` significa **descargas ilimitadas**
- El conteo es acumulativo: descargar la misma foto dos veces cuenta doble
- Las fotos siempre se muestran (previews), solo cambia la posibilidad de descargar
- El batch download puede ser N llamadas individuales o un endpoint dedicado
