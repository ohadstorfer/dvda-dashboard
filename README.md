# Gestor de Proyectos

Gestor personal de proyectos y tareas. React + Vite + Supabase, instalable como PWA.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests de lógica (vitest)
npm run build    # build de producción en dist/
```

## Configuración

Variables en `.env`:

- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` — clave publishable (segura para el cliente)

Supabase: tablas `projects` y `tasks` con RLS por usuario (ver
`docs/superpowers/specs/2026-06-09-react-supabase-conversion-design.md`).

## Deploy

Cualquier hosting estático con HTTPS (Vercel, Netlify, Cloudflare Pages):
build command `npm run build`, output `dist/`.

HTTPS es obligatorio para que la PWA sea instalable (iPhone: Safari →
Compartir → "Agregar a inicio").

## Migrar datos del HTML original

1. Abrir `gestor_proyectos.html` → "Exportar backup"
2. En la app nueva → "Importar backup" con ese archivo

## Referencia visual

`gestor_proyectos.html` es la referencia de diseño congelada. Screenshots
de referencia en `docs/screenshots/baseline/`; el diseño no se modifica.
