# Navigation Map — Photography Client Portal MVP

---

## Visitor (Anonymous)

```
/ (landing)
├── /services
├── /portfolio
├── /about
├── /contact
├── /quote-request
└── /login  →  client/activation  or  /admin/login
```

No authentication required. All public routes.

---

## Client (Authenticated)

```
/client/dashboard
  └── Lista de galerías asignadas
        └── click → /client/galleries/:id
              ├── Previsualización de todas las fotos
              └── Download solo las autorizadas

/client/profile
  └── Editar nombre, teléfono, etc.

/logout
```

Routes protected by auth guard. Redirect to `/login` if not authenticated.

---

## Photographer (Owner/Admin — Authenticated)

```
/admin/dashboard
  ├── Resumen: clientes, galerías, últimos downloads
  │
  ├── /admin/clients
  │   └── Lista de clientes
  │       └── click → /admin/clients/:id
  │             ├── Datos del cliente
  │             ├── Generar / desactivar access code
  │             ├── Enviar código por email
  │             ├── Activar / desactivar acceso
  │             └── Galerías asignadas
  │
  ├── /admin/galleries
  │   └── Lista de galerías
  │       ├── click → /admin/galleries/:id
  │       │     ├── Grid de fotos
  │       │     ├── Asignar permisos por cliente
  │       │     └── Archivar galería
  │       └── /admin/galleries/new
  │       └── /admin/galleries/:id/upload
  │             └── Subir fotos + generación de previews
  │
  ├── /admin/quote-requests
  │   └── Lista de solicitudes de cotización
  │       └── click → modal/detalle
  │             ├── Marcar como leída
  │             └── Archivar
  │
  ├── /admin/download-logs
  │   └── Tabla: foto, cliente, fecha, hora
  │
  └── /admin/profile
```

All `/admin/*` routes protected by auth + role check (photographer only).
