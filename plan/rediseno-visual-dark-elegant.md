# Rediseño Visual: Premium Warm / Gold Accent

## Motivación

El frontend actual usa Tailwind CSS v4 con una paleta básica gris/blanco que cumple funcionalmente pero no comunica la identidad de un estudio fotográfico profesional. Se busca transformar la experiencia visual para que sea **premium, cálida e impactante**, acorde al portafolio que el estudio quiere proyectar.

## Investigación UX/UI

### Fuentes consultadas
- DesignRush — Best Photographer Website Designs 2026
- Hook Agency — Luxury Website Colors That Signal Premium (2026)
- Styled Web Design — How to Create a Luxury Photography Website
- UX/UI best practices for photography portfolios
- Dark Mode Photography Portfolio Trends 2025 (melodytehub)

### Hallazgos clave

| Hallazgo | Aplicación |
|---|---|
| **"Luxury isn't about using dark colors or gold accents. It's about restraint and intention."** — Hook Agency | Menos es más. Paleta reducida (2-3 colores + neutros), uso consistente. |
| **"When your photography is this distinctive, your website's job is to be a beautiful frame, not the subject."** — Makena Creative | El diseño debe ser un marco elegante que no compita con las fotos. |
| **"Dark mode used properly closes 42% more clients"** — Melodyte Hub | El oscuro funciona para fotografía, pero el usuario NO quiere dark mode como default. Solución: usarlo estratégicamente (hero, header, footer) sin que sea el fondo general. |
| **"Warm neutrals + intentional accents = premium positioning"** — Hook Agency | Fondos cálidos (off-white, crema) con acentos dorados dan sensación de lujo sin ser fríos. |
| **"Generous whitespace, clean layouts, editorial typography"** — Styled Web Design | Espacio para respirar, tipografía editorial, layouts limpios. |
| **"Micro-interactions: text reveals, hover effects, subtle parallax"** — Múltiples fuentes | Animaciones pequeñas pero significativas que mejoran la experiencia sin distraer. |

## Principios de Diseño

| Principio | Descripción |
|---|---|
| **Premium + Cálido** | Fondo base en off-white/crema cálido (`#f8f6f2`). Fotografía resalta sobre fondos claros. Sensación de lujo acogedor, no frío. |
| **Oscuro estratégico** | Dark usado solo en hero (full-viewport), header, footer y sidebar admin. Así se mantiene el impacto dramático sin ser "dark mode". |
| **Acento Gold** | Dorado (`#d4a853`) para CTAs, highlights, active states. Señal de premium sin saturar. |
| **Impactante** | Landing page con hero full-viewport oscuro, animaciones de texto tipo reveal, staggered entrances, scroll-triggered reveals. |
| **Desktop-first + Responsivo** | Diseñado para desktop pero se adapta a tablet y mobile (hamburger nav, bottom nav admin, grids responsivos). |
| **Performance** | Animaciones solo con CSS Transitions/Animations + Intersection Observer ligero. Sin librerías externas. |
| **Backend intacto** | Solo se modifica la capa visual (JSX, Tailwind classes, CSS). No se toca lógica de negocio. |

## Paleta de Color

Inspirada en los tonos de las paletas "Nude" y "Golden Luxe" de Hook Agency, adaptadas a fotografía de estudio.

### Base clara (fondo general del sitio)

| Token | Hex | Uso |
|---|---|---|
| `bg-base` | `#f8f6f2` | Fondo general del body — cálido, acogedor |
| `bg-surface` | `#ffffff` | Cards, contenedores, formularios |
| `bg-elevated` | `#f3f0ea` | Secciones alternas, hover states |
| `border-light` | `#e5e1d9` | Bordes suaves en modo claro |
| `text-primary` | `#1c1a17` | Texto principal (warm black) |
| `text-secondary` | `#6b655e` | Texto secundario |
| `text-muted` | `#a09890` | Texto metadata/sutil |

### Oscuro estratégico (header, hero, footer, admin)

| Token | Hex | Uso |
|---|---|---|
| `dark-900` | `#161310` | Fondo hero, header, footer — warm dark |
| `dark-800` | `#1f1c18` | Cards en contexto oscuro, sidebar |
| `dark-700` | `#2b2722` | Bordes en contexto oscuro, inputs dark |
| `dark-600` | `#3a3530` | Bordes visibles en dark |
| `dark-500` | `#4a4540` | Hover states en dark |
| `text-dark-primary` | `#f0ede8` | Texto principal sobre fondo oscuro |
| `text-dark-secondary` | `#a8a29a` | Texto secundario sobre fondo oscuro |
| `text-dark-muted` | `#6b655e` | Texto sutil sobre fondo oscuro |

### Gold (acento premium)

| Token | Hex | Uso |
|---|---|---|
| `gold-500` | `#d4a853` | CTAs principales, highlights, badges |
| `gold-400` | `#e0b85c` | Hover de CTAs |
| `gold-600` | `#c9952e` | Active/pressed de CTAs |
| `gold-700` | `#b07d1a` | Texto gold sobre fondo claro |

### Semánticos

| Token | Hex | Uso |
|---|---|---|
| `success` | `#4a7c59` | Verde premium para active/success badges |
| `error` | `#b04a4a` | Rojo premium para errores |
| `warning` | `#c9952e` | Gold para advertencias |

## Tipografía

| Rol | Fuente | Fallback |
|---|---|---|
| Headings hero (público) | `Playfair Display` | `Georgia, serif` |
| Headings secciones | `Playfair Display` | `Georgia, serif` |
| Body | `Inter` | `system-ui, sans-serif` |
| Monospace (códigos) | `JetBrains Mono` | `Fira Code, monospace` |

## Animaciones (mejoradas)

Solo CSS nativo + Intersection Observer. Sin librerías externas.

### Hero — text reveal mejorado
El texto del hero debe tener más presencia y movimiento:

| Elemento | Animación | Timing |
|---|---|---|
| Headline "Fotografía Profesional" | `fade-in-down` + slide | 0.7s ease-out, delay 0s |
| Headline "para tu Negocio" (gold) | `fade-in-up` con clip-path reveal | 0.7s ease-out, delay 0.3s |
| Subtítulo (servicios listados) | `fade-in-up` | 0.6s, delay 0.6s |
| CTAs | `fade-in-up` + scale sutil | 0.5s, delay 0.9s |
| Scroll indicator | bounce infinito con fade-in | 1s, delay 1.5s |

### Scroll reveals (Intersection Observer)

| Elemento | Animación | Detalle |
|---|---|---|
| Service cards | `fade-in-up` escalonado | Stagger 120ms entre cards |
| Portfolio items | `fade-in` + scale(0.95 → 1) | Con clip-path reveal circular opcional |
| Section headings | `fade-in-left` | Aparecen desde la izquierda |
| CTA final | `fade-in-up` lento | 0.8s ease-out |
| Contador de stats | `count-up` numérico | Opcional, con CSS |

### Micro-interacciones (hover)

| Elemento | Efecto |
|---|---|
| Cards servicio | Scale(1.02) + border glow gold + shadow elevado |
| Portfolio thumbnails | Overlay con gradient + "Ver proyecto" slide-up + scale(1.05) en imagen |
| Botones gold | Glow hover (`box-shadow` gold), scale(0.97) active |
| Botones outline | Borde gold + texto gold en hover |
| Inputs | Focus ring gold + glow |
| Nav links | Subrayado animado (underline slide-in) o color transition |
| Gallery photos (admin) | Overlay dark con opacidad progresiva |
| Gallery photos (client) | Overlay dark + botón descargar gold slide-up |

### Layout de scroll
- Hero full-viewport (100vh) — oscuro, dramático
- Sección servicios: fondo claro (`bg-base`) con cards blancas
- Sección portafolio: fondo `bg-elevated` alterno
- CTA final: sobre fondo claro con acentos gold
- Footer: dark (`dark-900`) como bookend visual

## Screens a Rediseñar (15 total)

### Layouts (3)

| Archivo | Cambios visuales clave |
|---|---|
| `src/layouts/PublicLayout.tsx` | Header **oscuro** (`dark-900`) con glassmorphism al hacer scroll · Logo gold · Nav con hover gold · En mobile: hamburger menu con slide-in panel oscuro · Footer **oscuro** (`dark-900`) |
| `src/layouts/AdminLayout.tsx` | Sidebar `dark-800` con borde sutil · Active state gold · Header `dark-900` · Bottom nav en mobile · Slide-in panel para mobile |
| `src/layouts/ClientLayout.tsx` | Header `dark-900` consistente con admin · Nav simplificada · Footer dark sutil |

### Páginas Públicas (4)

| Archivo | Cambios visuales clave |
|---|---|
| `src/pages/public/Landing.tsx` | **Hero**: full-viewport oscuro (`dark-900`) con overlay gradient · Headline Playfair Display con text reveal animado · CTA gold con glow · Scroll indicator con bounce. **Sección servicios**: fondo `bg-base`, cards blancas (`bg-surface`) con hover gold glow y staggered entrance. **Sección portafolio**: fondo `bg-elevated`, grid con overlay hover, scale en imagen. **CTA final**: fondo `bg-base`, botón gold grande. |
| `src/pages/public/QuoteRequest.tsx` | Fondo `bg-base` · Formulario en card blanca (`bg-surface`) con border-light · Inputs con focus ring gold · Botón submit gold · Layout responsivo. |
| `src/pages/Login.tsx` | Fondo `bg-base` · Card blanca centrada · Inputs con focus gold · Botón gold · Link activación en gold. |
| `src/pages/Activation.tsx` | Fondo `bg-base` · Card blanca · Code inputs con focus gold y border-light · Dos pasos con íconos de progreso. |

### Páginas Admin (7)

| Archivo | Cambios visuales clave |
|---|---|
| `src/pages/admin/Dashboard.tsx` | Cards blancas con sombra sutil · Stats en gold · Timeline con bullets gold · Quotes en cards con borde gold para "NUEVO" |
| `src/pages/admin/clients/List.tsx` | Cards blancas con border-light · Avatar inicial · Badges success/error premium · Botón gold para "Nuevo" |
| `src/pages/admin/clients/Detail.tsx` | Secciones en cards blancas · Código de acceso en highlight gold · Tabla con header sutil |
| `src/pages/admin/galleries/List.tsx` | Cards blancas con border-light · Badge "Completado" en gold · Hover con borde gold |
| `src/pages/admin/galleries/Detail.tsx` | Grid de fotos con overlay dark hover · Botón "Subir" gold · Thumbnails con borde sutil |
| `src/pages/admin/galleries/Upload.tsx` | Dropzone con borde dashed gold · Thumbnails con overlay de estado · Botón gold para upload |
| *(Quotes y Logs sin ruta aún — se rediseñan cuando se implementen)* | |

### Páginas Cliente (2)

| Archivo | Cambios visuales clave |
|---|---|
| `src/pages/client/Dashboard.tsx` | Cards blancas con border-light · Hover con borde gold · Badge "Completada" en gold |
| `src/pages/client/GalleryView.tsx` | Grid con overlay dark hover · Botón gold para descargar · Checkboxes con accent gold · Badges premium |

## Arquitectura visual del Landing

```
┌──────────────────────────────────────┐
│         HERO (dark-900, 100vh)       │
│  ┌────────────────────────────────┐  │
│  │  Playfair Display headline     │  │  ← text reveal animado
│  │  Gold sub-headline             │  │  ← aparece después
│  │  Subtítulo servicios           │  │  ← fade-in up
│  │  [CTA Gold]  [Ver Portafolio]  │  │  ← fade-in up + glow
│  │        ↓ scroll indicator      │  │  ← bounce
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│   SERVICIOS (bg-base)                │
│   "Lo que ofrecemos" (fade-in left)  │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐              │  ← staggered fade-in up
│   │ 1 │ │ 2 │ │ 3 │ │ 4 │           │  ← hover scale + gold glow
│   └──┘ └──┘ └──┘ └──┘              │
├──────────────────────────────────────┤
│   PORTAFOLIO (bg-elevated)           │
│   "Trabajos recientes"               │
│   ┌────┐ ┌────┐ ┌────┐             │  ← hover overlay + scale
│   │ 01 │ │ 02 │ │ 03 │              │
│   └────┘ └────┘ └────┘             │
│   ┌────┐ ┌────┐ ┌────┐             │
│   │ 04 │ │ 05 │ │ 06 │              │
│   └────┘ └────┘ └────┘             │
├──────────────────────────────────────┤
│   CTA FINAL (bg-base)                │
│   "¿Listo para empezar?"             │  ← fade-in up
│   [Solicitar Cotización →]           │  ← gold glow
├──────────────────────────────────────┤
│         FOOTER (dark-900)            │
│         Photo Co. © 2026             │
└──────────────────────────────────────┘
```

## Archivos a Modificar (solo visual)

```
src/index.css                         → Tema (warm-light + dark estratégico + gold)
index.html                            → Google Fonts
src/layouts/PublicLayout.tsx          → Header/footer dark + nav responsiva
src/layouts/AdminLayout.tsx           → Sidebar dark + bottom nav mobile
src/layouts/ClientLayout.tsx          → Header dark consistente
src/pages/public/Landing.tsx          → Hero oscuro + texto animado + scroll reveals
src/pages/public/QuoteRequest.tsx     → Formulario en card blanca
src/pages/Login.tsx                   → Card blanca centrada
src/pages/Activation.tsx              → Card blanca + code inputs
src/pages/admin/Dashboard.tsx         → Stats + timeline
src/pages/admin/clients/List.tsx      → Cards blancas
src/pages/admin/clients/Detail.tsx    → Secciones en cards blancas
src/pages/admin/galleries/List.tsx    → Cards blancas
src/pages/admin/galleries/Detail.tsx  → Grid + overlays
src/pages/admin/galleries/Upload.tsx  → Dropzone gold
src/pages/client/Dashboard.tsx        → Cards blancas
src/pages/client/GalleryView.tsx      → Grid + overlays + botones gold
```

## Lo que NO se toca

- `src/lib/` — API, Supabase, R2, utils
- `src/hooks/` — TanStack Query hooks, auth hook, useInView hook
- `src/routes/` — Definición de rutas
- `src/guards/` — AuthGuard
- `src/pages/admin/galleries/Form.tsx` — Solo si requiere cambio visual (se evaluará)
- `src/pages/admin/clients/Form.tsx` — Solo si requiere cambio visual
- Supabase Edge Functions, migraciones, RLS
- `package.json`, `vite.config.ts`, configuraciones

## Notas

- No se agregan dependencias npm nuevas
- Las animaciones usan `@keyframes` en CSS + clases utilitarias Tailwind
- El Intersection Observer se implementa con hook ligero (`src/hooks/useInView.ts`) existente
- La paleta se define con `@theme` en `index.css` (Tailwind v4)
- Responsividad: puntos de quiebre `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- El hero oscuro está **deliberadamente** en la landing page porque busca impacto visual dramático. No es "dark mode" porque el resto del sitio es claro y cálido.
