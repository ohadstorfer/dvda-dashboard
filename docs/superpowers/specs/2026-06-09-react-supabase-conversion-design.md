# Gestor de Proyectos — React + Supabase Conversion

**Date:** 2026-06-09
**Status:** Approved

## Goal

Convert the single-file `gestor_proyectos.html` app into a Vite + React web app backed by Supabase, with the web UI **pixel-identical** to the current HTML on both desktop and mobile. The visual design never changes; persistence moves from localStorage to Supabase with multi-user accounts.

## Decisions made

| Decision | Choice |
|---|---|
| Platforms | Web only (no native apps) |
| Framework | Vite + React 18 (chosen over Expo/react-native-web to guarantee visual fidelity; user approved this deviation from the original "Expo" ask) |
| Styling | Original CSS copied verbatim into `src/styles.css`; components reuse the same class names |
| Auth | Supabase email + password, open sign-up, no email confirmation |
| Data isolation | Multi-user: each user sees only their own projects (RLS) |
| New users | Start with an empty workspace (no seed/demo data) |
| Migration | Via existing backup export/import (export JSON from old HTML, import in new app) |

## Supabase

- Project: `https://swbuspejkozzyqalpncn.supabase.co`
- Client key: publishable key (already provided), stored in `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Schema created via the Supabase MCP server.

### Schema

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('obra','personal')),
  status text not null check (status in ('active','paused','done')),
  descripcion text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  done boolean not null default false,
  priority text not null check (priority in ('alta','media','baja')),
  due_date text not null default '',
  assignee text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);
```

Notes:
- `due_date` is **free text** (e.g. `"05/06"`) to preserve current behavior exactly — no date picker, no parsing.
- `position` preserves task order (new tasks append, matching current `push` behavior).
- Projects created via the modal are **prepended** in the UI (current `unshift` behavior) — achieved by ordering projects by `created_at desc`.

### RLS

- `projects`: select/insert/update/delete only where `user_id = auth.uid()`.
- `tasks`: all operations allowed only when the parent project belongs to `auth.uid()` (via `exists` subquery).

## Architecture

```
src/
  main.jsx, App.jsx
  styles.css              ← original CSS, verbatim (plus login-screen styles)
  lib/supabase.js         ← createClient with env vars
  context/AuthContext.jsx ← session state, login/signup/logout
  hooks/useProjects.js    ← all data operations (fetch, CRUD, optimistic updates)
  components/
    Sidebar.jsx           ← nav, counts, backup actions, logout
    StatsGrid.jsx
    ProjectCard.jsx
    ProjectDetail.jsx     ← tasks panel + info panel (summary, notes, status)
    TaskItem.jsx
    ProjectModal.jsx      ← create + edit (same form)
    TaskModal.jsx
    Toast.jsx
    LoginScreen.jsx       ← new UI, same design language
```

- **No router.** App state mirrors the current shape: `{ view, selectedProject, projects[] }`. List/detail is a conditional render, exactly like today.
- **Fonts:** same Google Fonts `<link>` (DM Sans, DM Mono) in `index.html`.
- **HTML title/lang:** `lang="es"`, title "Gestor de Proyectos".

## Data flow

1. App boots → `AuthContext` checks session. No session → `LoginScreen`. Session → fetch projects + tasks (single query with join, ordered `created_at desc` / `position asc`).
2. All renders happen from local React state after the initial fetch.
3. **Optimistic updates** for every mutation (task toggle, task add/delete, project create/edit/delete, status change, notes): update state immediately, write to Supabase in background, revert + Spanish error toast on failure.
4. **Notes** save debounced (~800 ms after last keystroke) instead of per keystroke.
5. **Backup export:** downloads the user's projects+tasks as JSON (same file naming `backup_proyectos_YYYYMMDD.json`). **Import:** parses JSON array, inserts projects+tasks for the current user, replacing nothing (additive insert), then refetches. The old HTML's export format is accepted (field mapping: `desc` → `descripcion`, `date` → `due_date`).

## Behavior parity checklist

Everything below must behave exactly as in the HTML version:

- Sidebar filters (all/obra/personal/active/paused/done) with live counts; active nav highlight only when no project is selected.
- Stats: active projects, pending tasks, completed tasks, global progress %.
- Project cards: type accent bar (blue obra / purple personal), badges, pending count, progress bar + `x/y` label, hover lift.
- Detail view: back button, edit/delete buttons, task list with checkbox/priority chip/date/assignee, delete-on-hover actions, summary panel, notes textarea, status select.
- Modals: new/edit project, new task — same fields, same defaults (priority "media" preselected), backdrop click closes, name required (focus on empty).
- `window.confirm` before project delete.
- Toasts: same messages ("Proyecto creado ✓", "Tarea eliminada", etc.) + new error toasts.
- Empty states (no projects / no tasks) with same copy.
- Date subtitle: `toLocaleDateString('es-AR', {weekday, day, month, year})`.

## Login screen (new UI)

Centered card on `--bg` background, same card styling (`--surface`, `--border`, `--radius-lg`, `--shadow`), DM Sans, same form input styles, same primary button. Fields: email, password; toggle between "Iniciar sesión" and "Crear cuenta". Spanish error messages. A logout action is added to the sidebar footer (same `.sidebar-action` style).

## Visual regression safety

Before building: capture reference screenshots of the original HTML at 1280 / 800 / 375 px widths for list view and detail view (Playwright or similar). After each implementation phase, screenshot the React app at the same widths and compare; fix any drift before proceeding. This enforces the "never break desktop or mobile view" rule throughout the project.

## Error handling

- Failed mutations: revert optimistic change + toast "Error al guardar — reintentá".
- Failed initial fetch: error state with retry button.
- Session expiry / invalid token: return to login screen.
- Auth errors (wrong password, duplicate email): inline Spanish messages on the login card.

## Testing

- Visual: screenshot comparison at the three reference widths after each phase.
- Functional: manual pass of every CRUD flow, verified against the Supabase table editor.
- RLS: verify with two test accounts that data is isolated.

## Out of scope (YAGNI)

- Realtime sync between sessions/devices (last write wins is fine).
- Offline support.
- Native iOS/Android apps.
- Task editing modal (the HTML version only supports create/delete/toggle — parity preserved).
- Password reset flow (can be added later via Supabase's built-in recovery).
