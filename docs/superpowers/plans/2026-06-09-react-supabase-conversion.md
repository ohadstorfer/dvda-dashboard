# Gestor de Proyectos — React + Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `gestor_proyectos.html` into a Vite + React web app backed by Supabase (multi-user auth, RLS), installable as a PWA on iPhone, with the UI pixel-identical to the original HTML on desktop and mobile.

**Architecture:** Single-page React app, no router — same `{view, selectedProject, projects[]}` state shape as the HTML version. The original CSS is extracted verbatim into `src/styles.css` and components reuse the exact same class names, which is what guarantees visual fidelity. All data operations live in one `useProjects` hook with optimistic updates. Pure logic (filtering, counts, progress, backup parsing) is extracted into testable modules.

**Tech Stack:** Vite 5, React 18, @supabase/supabase-js v2, vitest (logic tests), Playwright (screenshots/visual regression), vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-06-09-react-supabase-conversion-design.md`

**Important notes for the executor:**

- **Visual rule:** the design is LOCKED. Never "improve" spacing, colors, or markup. Components must produce the same class names and DOM structure as the original HTML's render functions.
- **UI tasks (8–10):** per user config, install and consult the `emilkowalski/skill` skill first (`npx skills add emilkowalski/skill`) — apply its craft guidance (interaction quality, implementation details) WITHOUT changing the locked visual design.
- **Supabase MCP:** the project MCP server `supabase` is configured in `.mcp.json`. Use ToolSearch to load its tools (e.g. `apply_migration`, `execute_sql`, `list_tables`, `get_advisors`) before Task 3.
- Project root = repo root (`/Users/ohadstorfer/Desktop/vdva-dashboard`). The Vite app lives at the root, alongside `gestor_proyectos.html` (which stays untouched as the reference).

---

### Task 1: Scaffold Vite + React app with the original CSS

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `.env`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "gestor-proyectos",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "playwright": "^1.47.0"
  }
}
```

- [ ] **Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Write `index.html`** (same lang/title/fonts as the original)

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gestor de Proyectos</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
dist/
.env
```

- [ ] **Step 5: Write `.env`** (publishable key — safe for the client, but kept out of git)

```
VITE_SUPABASE_URL=https://swbuspejkozzyqalpncn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_BPSyt7I_rmvr4tRyIcJo5A_kQlQO9bg
```

- [ ] **Step 6: Extract the original CSS verbatim**

Run: `sed -n '9,418p' gestor_proyectos.html > src/styles.css`

Verify: `head -3 src/styles.css` shows `*, *::before, *::after { box-sizing...` and `tail -2 src/styles.css` ends with the closing `}` of the 640px media query. `wc -l src/styles.css` → 410.

- [ ] **Step 7: Write `src/main.jsx` and placeholder `src/App.jsx`**

`src/main.jsx`:
```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)
```

`src/App.jsx` (temporary placeholder, replaced in Task 6):
```jsx
export default function App() {
  return (
    <div className="layout">
      <main className="main" style={{ marginLeft: 0, maxWidth: '100%' }}>
        <div className="page-title">Gestor de Proyectos</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 8: Install and verify dev server**

Run: `npm install` (expect success, no peer errors)
Run: `npm run dev &` then `curl -s http://localhost:5173 | grep -o '<title>[^<]*'`
Expected: `<title>Gestor de Proyectos`
Kill the dev server after checking.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html .gitignore src/
git commit -m "feat: scaffold Vite + React app with original CSS verbatim"
```

---

### Task 2: Baseline screenshots of the original HTML + demo data file

**Files:**
- Create: `scripts/screenshot.mjs`, `scripts/demo-data.json`, `docs/screenshots/baseline/*.png`

- [ ] **Step 1: Install the Playwright Chromium browser**

Run: `npx playwright install chromium` (downloads browser; takes a minute)

- [ ] **Step 2: Write `scripts/screenshot.mjs`**

```js
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const url = process.argv[2]
const outDir = process.argv[3]
if (!url || !outDir) {
  console.error('Usage: node scripts/screenshot.mjs <url> <outDir>')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

const sizes = [
  { name: 'desktop', w: 1280, h: 800 },
  { name: 'tablet', w: 800, h: 900 },
  { name: 'mobile', w: 375, h: 812 },
]

const browser = await chromium.launch()
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } })
  await page.goto(url)
  // Optional login (for the React app; the original HTML has no login)
  if (process.env.TEST_EMAIL) {
    await page.fill('input[type=email]', process.env.TEST_EMAIL)
    await page.fill('input[type=password]', process.env.TEST_PASSWORD)
    await page.click('button.btn-primary')
    await page.waitForSelector('.stats-grid', { timeout: 10000 })
  }
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${outDir}/list-${s.name}.png`, fullPage: true })
  await page.click('.project-card')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outDir}/detail-${s.name}.png`, fullPage: true })
  await page.close()
}
await browser.close()
console.log('Screenshots saved to', outDir)
```

- [ ] **Step 3: Write `scripts/demo-data.json`** (the HTML's seed data, in the backup format — used later to populate a test account for visual comparison)

```json
[
  {
    "name": "Reforma casa Palermo", "type": "obra", "status": "active",
    "desc": "Remodelación cocina y baños. Contratistas definidos.", "notes": "",
    "tasks": [
      { "name": "Confirmar planos con arquitecto", "done": false, "priority": "alta", "date": "05/06", "assignee": "" },
      { "name": "Pedir presupuesto cerámicos", "done": false, "priority": "alta", "date": "08/06", "assignee": "" },
      { "name": "Contratar electricista", "done": true, "priority": "media", "date": "01/06", "assignee": "" }
    ]
  },
  {
    "name": "Edificio Corrientes 1420", "type": "obra", "status": "active",
    "desc": "Obra nueva PH 4to piso. En estructura.", "notes": "",
    "tasks": [
      { "name": "Revisión de columnas con ingeniero", "done": false, "priority": "alta", "date": "10/06", "assignee": "" },
      { "name": "Comprar hierro para losa", "done": false, "priority": "media", "date": "12/06", "assignee": "" },
      { "name": "Pago cuota contratista junio", "done": false, "priority": "alta", "date": "06/06", "assignee": "" }
    ]
  },
  {
    "name": "Finanzas personales", "type": "personal", "status": "active",
    "desc": "Reorganizar inversiones y presupuesto mensual.", "notes": "",
    "tasks": [
      { "name": "Revisar opciones de plazo fijo", "done": true, "priority": "media", "date": "01/06", "assignee": "" },
      { "name": "Reunión con contador", "done": false, "priority": "alta", "date": "15/06", "assignee": "" }
    ]
  },
  {
    "name": "Viaje julio", "type": "personal", "status": "paused",
    "desc": "Organizar vacaciones de invierno con familia.", "notes": "",
    "tasks": [
      { "name": "Comparar destinos", "done": true, "priority": "baja", "date": "30/05", "assignee": "" },
      { "name": "Reservar alojamiento", "done": false, "priority": "media", "date": "20/06", "assignee": "" }
    ]
  }
]
```

- [ ] **Step 4: Capture baselines from the original HTML**

Run: `node scripts/screenshot.mjs "file:///Users/ohadstorfer/Desktop/vdva-dashboard/gestor_proyectos.html" docs/screenshots/baseline`
Expected: `Screenshots saved to docs/screenshots/baseline` and 6 PNGs exist (`list-desktop/tablet/mobile`, `detail-desktop/tablet/mobile`).
Read the desktop PNGs to confirm they show the seeded dashboard and a project detail view.

- [ ] **Step 5: Commit**

```bash
git add scripts/ docs/screenshots/baseline/
git commit -m "test: capture baseline screenshots of original HTML at 3 widths"
```

---

### Task 3: Supabase schema + RLS

**Files:** none (remote database, via the `supabase` MCP server)

- [ ] **Step 1: Load the Supabase MCP tools**

Use ToolSearch with query `+supabase migration` to load `apply_migration`, `list_tables`, `get_advisors`.

- [ ] **Step 2: Apply the migration** (name: `create_projects_and_tasks`)

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('obra','personal')),
  status text not null check (status in ('active','paused','done')),
  descripcion text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);

alter table public.projects enable row level security;

create policy "own projects select" on public.projects
  for select using (auth.uid() = user_id);
create policy "own projects insert" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "own projects update" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own projects delete" on public.projects
  for delete using (auth.uid() = user_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  done boolean not null default false,
  priority text not null check (priority in ('alta','media','baja')),
  due_date text not null default '',
  assignee text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks(project_id);

alter table public.tasks enable row level security;

create policy "own tasks all" on public.tasks
  for all
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
```

- [ ] **Step 3: Verify**

Use `list_tables`: expect `projects` and `tasks` in schema `public`, both with `rls_enabled: true`.
Use `get_advisors` (type: security): expect no errors about these tables (the "leaked password protection" warning, if present, is pre-existing and out of scope).

- [ ] **Step 4: Flag the manual auth setting**

Tell the user: in the Supabase dashboard → Authentication → Sign In / Up → Email, **disable "Confirm email"** (spec: open sign-up without confirmation). The app handles the confirm-on case gracefully (Task 6), but the spec wants it off. This cannot be done via SQL.

---

### Task 4: Pure logic modules (TDD)

**Files:**
- Create: `src/lib/logic.js`, `src/lib/logic.test.js`, `src/lib/mappers.js`, `src/lib/mappers.test.js`, `src/lib/backup.js`, `src/lib/backup.test.js`

- [ ] **Step 1: Write the failing tests for `logic.js`**

`src/lib/logic.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { progress, getFiltered, getCounts, VIEW_LABELS, STATUS_LABELS } from './logic'

const P = (over = {}) => ({ id: '1', type: 'obra', status: 'active', tasks: [], ...over })

describe('progress', () => {
  it('returns 0 for empty task list', () => {
    expect(progress([])).toBe(0)
  })
  it('rounds the done percentage', () => {
    expect(progress([{ done: true }, { done: false }, { done: false }])).toBe(33)
  })
  it('returns 100 when all done', () => {
    expect(progress([{ done: true }, { done: true }])).toBe(100)
  })
})

describe('getFiltered', () => {
  const ps = [
    P({ id: 'a', type: 'obra', status: 'active' }),
    P({ id: 'b', type: 'personal', status: 'paused' }),
    P({ id: 'c', type: 'personal', status: 'done' }),
  ]
  it('returns all for view=all', () => expect(getFiltered(ps, 'all')).toHaveLength(3))
  it('filters by type', () => {
    expect(getFiltered(ps, 'obra').map(p => p.id)).toEqual(['a'])
    expect(getFiltered(ps, 'personal').map(p => p.id)).toEqual(['b', 'c'])
  })
  it('filters by status', () => {
    expect(getFiltered(ps, 'active').map(p => p.id)).toEqual(['a'])
    expect(getFiltered(ps, 'paused').map(p => p.id)).toEqual(['b'])
    expect(getFiltered(ps, 'done').map(p => p.id)).toEqual(['c'])
  })
})

describe('getCounts', () => {
  it('counts every view bucket', () => {
    const ps = [
      P({ type: 'obra', status: 'active' }),
      P({ type: 'personal', status: 'active' }),
      P({ type: 'personal', status: 'done' }),
    ]
    expect(getCounts(ps)).toEqual({ all: 3, obra: 1, personal: 2, active: 2, paused: 0, done: 1 })
  })
})

describe('labels', () => {
  it('matches the original HTML copy', () => {
    expect(VIEW_LABELS.all).toBe('Todos los proyectos')
    expect(VIEW_LABELS.obra).toBe('Obras y trabajos')
    expect(STATUS_LABELS.paused).toBe('Pausado')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/logic.test.js`
Expected: FAIL — cannot resolve `./logic`

- [ ] **Step 3: Implement `src/lib/logic.js`**

```js
export function progress(tasks) {
  if (!tasks.length) return 0
  return Math.round(tasks.filter(t => t.done).length / tasks.length * 100)
}

export function getFiltered(projects, view) {
  if (view === 'obra' || view === 'personal') return projects.filter(p => p.type === view)
  if (view === 'active' || view === 'paused' || view === 'done') return projects.filter(p => p.status === view)
  return projects
}

export function getCounts(projects) {
  return {
    all: projects.length,
    obra: projects.filter(p => p.type === 'obra').length,
    personal: projects.filter(p => p.type === 'personal').length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    done: projects.filter(p => p.status === 'done').length,
  }
}

export const VIEW_LABELS = {
  all: 'Todos los proyectos',
  obra: 'Obras y trabajos',
  personal: 'Proyectos personales',
  active: 'Proyectos activos',
  paused: 'Proyectos pausados',
  done: 'Proyectos finalizados',
}

export const STATUS_LABELS = { active: 'Activo', paused: 'Pausado', done: 'Finalizado' }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/logic.test.js` — Expected: PASS (all green)

- [ ] **Step 5: Write the failing tests for `mappers.js`**

`src/lib/mappers.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { projectFromRow, taskFromRow } from './mappers'

describe('taskFromRow', () => {
  it('maps DB columns to app fields', () => {
    expect(taskFromRow({
      id: 't1', name: 'Comprar hierro', done: false, priority: 'media',
      due_date: '12/06', assignee: 'Ana', position: 2,
    })).toEqual({ id: 't1', name: 'Comprar hierro', done: false, priority: 'media', date: '12/06', assignee: 'Ana', position: 2 })
  })
})

describe('projectFromRow', () => {
  it('maps columns, formats createdAt as es-AR, sorts tasks by position', () => {
    const p = projectFromRow({
      id: 'p1', name: 'Obra', type: 'obra', status: 'active',
      descripcion: 'Desc', notes: 'N', created_at: '2026-06-09T12:00:00Z',
      tasks: [
        { id: 'b', name: 'B', done: false, priority: 'media', due_date: '', assignee: '', position: 1 },
        { id: 'a', name: 'A', done: true, priority: 'alta', due_date: '', assignee: '', position: 0 },
      ],
    })
    expect(p.desc).toBe('Desc')
    expect(p.createdAt).toBe(new Date('2026-06-09T12:00:00Z').toLocaleDateString('es-AR'))
    expect(p.tasks.map(t => t.id)).toEqual(['a', 'b'])
  })
  it('tolerates missing tasks array', () => {
    const p = projectFromRow({ id: 'p1', name: 'X', type: 'obra', status: 'active', descripcion: '', notes: '', created_at: '2026-06-09T12:00:00Z' })
    expect(p.tasks).toEqual([])
  })
})
```

- [ ] **Step 6: Run to verify failure, then implement `src/lib/mappers.js`**

Run: `npx vitest run src/lib/mappers.test.js` — Expected: FAIL

```js
export function taskFromRow(r) {
  return {
    id: r.id, name: r.name, done: r.done, priority: r.priority,
    date: r.due_date, assignee: r.assignee, position: r.position,
  }
}

export function projectFromRow(row) {
  const tasks = (row.tasks || []).slice().sort((a, b) => a.position - b.position).map(taskFromRow)
  return {
    id: row.id, name: row.name, type: row.type, status: row.status,
    desc: row.descripcion, notes: row.notes,
    createdAt: new Date(row.created_at).toLocaleDateString('es-AR'),
    tasks,
  }
}
```

Run: `npx vitest run src/lib/mappers.test.js` — Expected: PASS

- [ ] **Step 7: Write the failing tests for `backup.js`**

`src/lib/backup.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { parseBackup, serializeBackup, backupFilename } from './backup'

describe('parseBackup', () => {
  it('returns null for invalid JSON or non-array', () => {
    expect(parseBackup('not json')).toBeNull()
    expect(parseBackup('{"a":1}')).toBeNull()
  })
  it('accepts the old HTML export format (desc/date fields)', () => {
    const out = parseBackup(JSON.stringify([{
      id: 'x', name: 'Obra 1', type: 'obra', status: 'active', desc: 'D', notes: '',
      createdAt: '9/6/2026',
      tasks: [{ id: 'y', name: 'T1', done: true, priority: 'alta', date: '05/06', assignee: 'Ana' }],
    }]))
    expect(out).toHaveLength(1)
    expect(out[0].desc).toBe('D')
    expect(out[0].tasks[0]).toEqual({ name: 'T1', done: true, priority: 'alta', date: '05/06', assignee: 'Ana', position: 0 })
  })
  it('applies safe defaults for bad values', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', type: 'weird', status: 'weird', tasks: [{ name: 'T', priority: 'weird' }] }]))
    expect(out[0].type).toBe('obra')
    expect(out[0].status).toBe('active')
    expect(out[0].tasks[0].priority).toBe('media')
    expect(out[0].tasks[0].done).toBe(false)
  })
  it('drops tasks without a name', () => {
    const out = parseBackup(JSON.stringify([{ name: 'X', tasks: [{ name: '' }, { name: 'ok' }] }]))
    expect(out[0].tasks).toHaveLength(1)
  })
})

describe('serializeBackup', () => {
  it('round-trips through parseBackup', () => {
    const projects = [{
      id: 'p', name: 'Obra', type: 'obra', status: 'paused', desc: 'D', notes: 'N', createdAt: 'x',
      tasks: [{ id: 't', name: 'T', done: false, priority: 'baja', date: '01/07', assignee: '', position: 0 }],
    }]
    const parsed = parseBackup(serializeBackup(projects))
    expect(parsed[0].name).toBe('Obra')
    expect(parsed[0].tasks[0].date).toBe('01/07')
  })
})

describe('backupFilename', () => {
  it('formats as backup_proyectos_YYYYMMDD.json', () => {
    expect(backupFilename(new Date(2026, 5, 9))).toBe('backup_proyectos_20260609.json')
  })
})
```

- [ ] **Step 8: Run to verify failure, then implement `src/lib/backup.js`**

Run: `npx vitest run src/lib/backup.test.js` — Expected: FAIL

```js
// Accepts both the old HTML export format and this app's export format.
export function parseBackup(text) {
  let data
  try { data = JSON.parse(text) } catch { return null }
  if (!Array.isArray(data)) return null
  return data.map(p => ({
    name: String(p.name || 'Sin nombre'),
    type: p.type === 'personal' ? 'personal' : 'obra',
    status: ['active', 'paused', 'done'].includes(p.status) ? p.status : 'active',
    desc: String(p.desc ?? p.descripcion ?? ''),
    notes: String(p.notes ?? ''),
    tasks: Array.isArray(p.tasks) ? p.tasks
      .map((t, i) => ({
        name: String(t.name || ''),
        done: Boolean(t.done),
        priority: ['alta', 'media', 'baja'].includes(t.priority) ? t.priority : 'media',
        date: String(t.date ?? t.due_date ?? ''),
        assignee: String(t.assignee ?? ''),
        position: i,
      }))
      .filter(t => t.name) : [],
  }))
}

export function serializeBackup(projects) {
  return JSON.stringify(projects.map(p => ({
    name: p.name, type: p.type, status: p.status, desc: p.desc, notes: p.notes,
    tasks: p.tasks.map(t => ({ name: t.name, done: t.done, priority: t.priority, date: t.date, assignee: t.assignee })),
  })), null, 2)
}

export function backupFilename(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `backup_proyectos_${y}${m}${d}.json`
}
```

Run: `npx vitest run` — Expected: ALL tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/lib/
git commit -m "feat: pure logic modules (filters, counts, mappers, backup) with tests"
```

---

### Task 5: Toast system

**Files:**
- Create: `src/context/ToastContext.jsx`

- [ ] **Step 1: Write `src/context/ToastContext.jsx`** (replicates the HTML `toast()`: bottom-center, auto-removes after 2400 ms, stacking allowed)

```jsx
import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(ts => [...ts, { id, msg }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2400)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </ToastContext.Provider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ToastContext.jsx
git commit -m "feat: toast system matching original behavior"
```

---

### Task 6: Supabase client, AuthContext, LoginScreen

**Files:**
- Create: `src/lib/supabase.js`, `src/context/AuthContext.jsx`, `src/components/LoginScreen.jsx`
- Modify: `src/styles.css` (append login styles), `src/App.jsx` (replace placeholder)

- [ ] **Step 1: Write `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
```

- [ ] **Step 2: Write `src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>
}
```

- [ ] **Step 3: Append login styles to `src/styles.css`** (same design language; nothing existing is modified)

```css

/* LOGIN (new screen — same design language as the original) */
.auth-screen {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg);
  padding: 20px;
}
.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 32px 28px;
  width: 100%; max-width: 380px;
}
.auth-logo { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
.auth-sub { font-size: 12px; color: var(--text3); font-family: 'DM Mono', monospace; margin-bottom: 24px; }
.auth-error {
  background: var(--red-bg); color: var(--red);
  font-size: 12.5px; padding: 8px 11px;
  border-radius: var(--radius); margin-bottom: 14px;
}
.auth-info {
  background: var(--green-bg); color: var(--green);
  font-size: 12.5px; padding: 8px 11px;
  border-radius: var(--radius); margin-bottom: 14px;
}
.auth-toggle { font-size: 13px; color: var(--text2); margin-top: 16px; text-align: center; }
.auth-toggle a { color: var(--accent); cursor: pointer; font-weight: 500; }
.btn-block { width: 100%; justify-content: center; }
```

- [ ] **Step 4: Write `src/components/LoginScreen.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'User already registered': 'Ya existe una cuenta con ese email',
}

export default function LoginScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    const { data, error: err } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (err) {
      setError(ERROR_MESSAGES[err.message] || 'Error: ' + err.message)
    } else if (mode === 'signup' && !data.session) {
      // Email confirmation is enabled on the Supabase project
      setInfo('Cuenta creada — revisá tu email para confirmarla')
    }
    // On success with a session, AuthContext picks it up and the app renders
  }

  function switchMode(m) { setMode(m); setError(''); setInfo('') }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">Proyectos</div>
        <div className="auth-sub">gestor personal</div>
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
        <div className="auth-toggle">
          {mode === 'login'
            ? <>¿No tenés cuenta? <a onClick={() => switchMode('signup')}>Creá una</a></>
            : <>¿Ya tenés cuenta? <a onClick={() => switchMode('login')}>Iniciá sesión</a></>}
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Replace `src/App.jsx`** (gate: login vs app; the `Dashboard` import arrives in Task 8, so use a temporary inline placeholder)

```jsx
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginScreen from './components/LoginScreen'

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <LoginScreen />
  // Replaced with <Dashboard userId={session.user.id} /> in Task 8
  return (
    <div className="layout">
      <main className="main" style={{ marginLeft: 0, maxWidth: '100%' }}>
        <div className="page-title">Sesión iniciada: {session.user.email}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  )
}
```

- [ ] **Step 6: Verify auth end-to-end**

Run the dev server. Using Playwright (or manually): open `http://localhost:5173`, create account `test1@example.com` / `test123456` via "Creá una".
Expected: either the logged-in placeholder appears (confirmation disabled — good), or the "revisá tu email" info shows (then remind the user about the Task 3 manual step and confirm the user via Supabase dashboard or MCP `execute_sql`: `update auth.users set email_confirmed_at = now() where email = 'test1@example.com';` — dev-only shortcut).
Then verify login works with the same credentials.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: Supabase auth with login/signup screen"
```

---

### Task 7: useProjects data hook

**Files:**
- Create: `src/hooks/useProjects.js`

- [ ] **Step 1: Write `src/hooks/useProjects.js`**

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { projectFromRow, taskFromRow } from '../lib/mappers'
import { useToast } from '../context/ToastContext'

const SAVE_ERROR = 'Error al guardar — reintentá'

export function useProjects(userId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const toast = useToast()
  const notesTimers = useRef({})

  const refetch = useCallback(async () => {
    setLoadError(false)
    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .order('created_at', { ascending: false })
    if (error) { setLoadError(true); setLoading(false); return }
    setProjects(data.map(projectFromRow))
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const createProject = useCallback(async (fields) => {
    const { data, error } = await supabase.from('projects')
      .insert({ user_id: userId, name: fields.name, type: fields.type, status: fields.status, descripcion: fields.desc })
      .select('*, tasks(*)')
      .single()
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => [projectFromRow(data), ...ps])
    toast('Proyecto creado ✓')
    return true
  }, [userId, toast])

  const updateProject = useCallback(async (id, fields) => {
    const { error } = await supabase.from('projects')
      .update({ name: fields.name, type: fields.type, status: fields.status, descripcion: fields.desc })
      .eq('id', id)
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => ps.map(p => p.id === id ? { ...p, name: fields.name, type: fields.type, status: fields.status, desc: fields.desc } : p))
    toast('Proyecto actualizado ✓')
    return true
  }, [toast])

  const deleteProject = useCallback(async (id) => {
    const prev = projects
    setProjects(ps => ps.filter(p => p.id !== id))
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Proyecto eliminado')
  }, [projects, toast])

  const changeStatus = useCallback(async (id, status) => {
    const prev = projects
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status } : p))
    const { error } = await supabase.from('projects').update({ status }).eq('id', id)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Estado actualizado')
  }, [projects, toast])

  const saveNotes = useCallback((id, notes) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, notes } : p))
    clearTimeout(notesTimers.current[id])
    notesTimers.current[id] = setTimeout(async () => {
      const { error } = await supabase.from('projects').update({ notes }).eq('id', id)
      if (error) toast(SAVE_ERROR)
    }, 800)
  }, [toast])

  const addTask = useCallback(async (projId, fields) => {
    const proj = projects.find(p => p.id === projId)
    const position = proj ? proj.tasks.length : 0
    const { data, error } = await supabase.from('tasks')
      .insert({ project_id: projId, name: fields.name, priority: fields.priority, due_date: fields.date, assignee: fields.assignee, position })
      .select()
      .single()
    if (error) { toast(SAVE_ERROR); return false }
    setProjects(ps => ps.map(p => p.id === projId ? { ...p, tasks: [...p.tasks, taskFromRow(data)] } : p))
    toast('Tarea agregada ✓')
    return true
  }, [projects, toast])

  const toggleTask = useCallback(async (projId, taskId) => {
    const proj = projects.find(p => p.id === projId)
    const task = proj && proj.tasks.find(t => t.id === taskId)
    if (!task) return
    const done = !task.done
    const prev = projects
    setProjects(ps => ps.map(p => p.id === projId
      ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done } : t) }
      : p))
    const { error } = await supabase.from('tasks').update({ done }).eq('id', taskId)
    if (error) { setProjects(prev); toast(SAVE_ERROR) }
  }, [projects, toast])

  const deleteTask = useCallback(async (projId, taskId) => {
    const prev = projects
    setProjects(ps => ps.map(p => p.id === projId
      ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
      : p))
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) { setProjects(prev); toast(SAVE_ERROR); return }
    toast('Tarea eliminada')
  }, [projects, toast])

  const importBackup = useCallback(async (parsed) => {
    // Insert in reverse so the first project in the file gets the newest
    // created_at and therefore appears first (matches the HTML's array order).
    for (const p of [...parsed].reverse()) {
      const { data, error } = await supabase.from('projects')
        .insert({ user_id: userId, name: p.name, type: p.type, status: p.status, descripcion: p.desc, notes: p.notes })
        .select()
        .single()
      if (error) { toast('Error al importar'); return false }
      if (p.tasks.length) {
        const { error: taskError } = await supabase.from('tasks').insert(
          p.tasks.map(t => ({ project_id: data.id, name: t.name, done: t.done, priority: t.priority, due_date: t.date, assignee: t.assignee, position: t.position })),
        )
        if (taskError) { toast('Error al importar'); return false }
      }
    }
    await refetch()
    toast('Backup importado ✓')
    return true
  }, [userId, refetch, toast])

  return {
    projects, loading, loadError, refetch,
    createProject, updateProject, deleteProject, changeStatus, saveNotes,
    addTask, toggleTask, deleteTask, importBackup,
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds (hook isn't wired into the UI yet; this catches syntax/import errors).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProjects.js
git commit -m "feat: useProjects hook with optimistic updates and backup import"
```

---

### Task 8: Sidebar, StatsGrid-equivalent ListView, ProjectCard, Dashboard (list view)

> Install/load `emilkowalski/skill` before this task (see plan header). Visual design stays locked.

**Files:**
- Create: `src/components/Sidebar.jsx`, `src/components/ListView.jsx`, `src/components/ProjectCard.jsx`, `src/components/Dashboard.jsx`
- Modify: `src/App.jsx` (swap placeholder for Dashboard)

- [ ] **Step 1: Write `src/components/Sidebar.jsx`** (same DOM as the HTML `<aside>`, plus the new logout action; import/export handlers wired in Task 11 — buttons receive the props now)

```jsx
import { useRef } from 'react'
import { getCounts } from '../lib/logic'
import { supabase } from '../lib/supabase'

export default function Sidebar({ projects, view, detailOpen, onSetView, onExport, onImportFile }) {
  const counts = getCounts(projects)
  const fileRef = useRef(null)

  const navItem = (key, icon, label) => (
    <div className={'nav-item' + (view === key && !detailOpen ? ' active' : '')} onClick={() => onSetView(key)}>
      <span className="nav-icon">{icon}</span> {label}
      <span className="nav-count">{counts[key]}</span>
    </div>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">Proyectos</div>
        <div className="logo-sub">gestor personal</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Vistas</div>
        {navItem('all', '⊞', 'Todos')}
        {navItem('obra', '🏗', 'Obras')}
        {navItem('personal', '👤', 'Personal')}
        <div className="nav-section-label" style={{ marginTop: 12 }}>Estado</div>
        {navItem('active', '▶', 'Activos')}
        {navItem('paused', '⏸', 'Pausados')}
        {navItem('done', '✓', 'Finalizados')}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-action" onClick={onExport}>
          <span>⬇</span> Exportar backup
        </button>
        <button className="sidebar-action" onClick={() => fileRef.current.click()}>
          <span>⬆</span> Importar backup
        </button>
        <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={onImportFile} />
        <button className="sidebar-action" onClick={() => supabase.auth.signOut()}>
          <span>→</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Write `src/components/ProjectCard.jsx`** (same DOM as `renderProjectCard`)

```jsx
import { progress, STATUS_LABELS } from '../lib/logic'

export default function ProjectCard({ project: p, onClick }) {
  const prog = progress(p.tasks)
  const pending = p.tasks.filter(t => !t.done).length
  const doneCount = p.tasks.filter(t => t.done).length

  return (
    <div className={`project-card ${p.type}`} onClick={onClick}>
      <div className="card-top">
        <div className="card-name">{p.name}</div>
        <span className={`badge badge-${p.type}`}>{p.type === 'obra' ? 'Obra' : 'Personal'}</span>
      </div>
      <div className="card-desc">
        {p.desc || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Sin descripción</span>}
      </div>
      <div className="card-footer">
        <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
        <span className="card-tasks-info">{pending} pendiente{pending !== 1 ? 's' : ''}</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-label">
          <span>{prog}% completado</span>
          <span>{doneCount}/{p.tasks.length}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${prog}%` }} /></div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/ListView.jsx`** (same DOM as `renderList`)

```jsx
import { getFiltered, VIEW_LABELS } from '../lib/logic'
import ProjectCard from './ProjectCard'

export default function ListView({ projects, view, onSelect, onNewProject }) {
  const ps = getFiltered(projects, view)
  const allTasks = projects.flatMap(p => p.tasks)
  const pending = allTasks.filter(t => !t.done).length
  const done = allTasks.filter(t => t.done).length
  const activeProjs = projects.filter(p => p.status === 'active').length

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{VIEW_LABELS[view]}</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewProject}>+ Nuevo proyecto</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Proyectos activos</div>
          <div className="stat-value">{activeProjs}</div>
          <div className="stat-desc">de {projects.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tareas pendientes</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-desc">sin completar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completadas</div>
          <div className="stat-value">{done}</div>
          <div className="stat-desc">de {allTasks.length} tareas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Progreso global</div>
          <div className="stat-value">{allTasks.length ? Math.round(done / allTasks.length * 100) : 0}%</div>
          <div className="stat-desc">completado</div>
        </div>
      </div>

      <div className="projects-grid">
        {ps.length ? ps.map(p => (
          <ProjectCard key={p.id} project={p} onClick={() => onSelect(p.id)} />
        )) : (
          <div className="empty" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">📁</div>
            <div className="empty-title">Sin proyectos</div>
            <div className="empty-desc">Creá el primer proyecto con el botón de arriba</div>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Write `src/components/Dashboard.jsx`** (list view only; detail and modals land in Tasks 9–11)

```jsx
import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import Sidebar from './Sidebar'
import ListView from './ListView'

export default function Dashboard({ userId }) {
  const [view, setView] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const data = useProjects(userId)
  const selected = data.projects.find(p => p.id === selectedId) || null

  function handleSetView(v) {
    setView(v)
    setSelectedId(null)
  }

  if (data.loading) return null

  return (
    <div className="layout">
      <Sidebar
        projects={data.projects}
        view={view}
        detailOpen={!!selected}
        onSetView={handleSetView}
        onExport={() => {}}
        onImportFile={() => {}}
      />
      <main className="main">
        {data.loadError ? (
          <div className="empty">
            <div className="empty-icon">⚠</div>
            <div className="empty-title">No se pudieron cargar los proyectos</div>
            <div className="empty-desc">
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={data.refetch}>Reintentar</button>
            </div>
          </div>
        ) : (
          <ListView
            projects={data.projects}
            view={view}
            onSelect={setSelectedId}
            onNewProject={() => {}}
          />
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Update `src/App.jsx`** — replace the `Gate` placeholder return with the Dashboard

The full file becomes:
```jsx
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <LoginScreen />
  return <Dashboard userId={session.user.id} />
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  )
}
```

- [ ] **Step 6: Verify in browser**

Dev server + Playwright (or manual): log in as `test1@example.com`. Expected: sidebar with counts at 0, stats at 0, empty state "Sin proyectos". Compare side-by-side with `docs/screenshots/baseline/list-desktop.png` — header, sidebar, stat cards must match (values differ; layout identical).

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: dashboard list view (sidebar, stats, project cards)"
```

---

### Task 9: ProjectDetail + TaskItem

> `emilkowalski/skill` applies (see plan header). Visual design stays locked.

**Files:**
- Create: `src/components/ProjectDetail.jsx`, `src/components/TaskItem.jsx`
- Modify: `src/components/Dashboard.jsx`

- [ ] **Step 1: Write `src/components/TaskItem.jsx`** (same DOM as `renderTask`)

```jsx
export default function TaskItem({ task: t, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <div className={'task-checkbox' + (t.done ? ' done' : '')} onClick={onToggle} />
      <div className="task-content">
        <div className={'task-name' + (t.done ? ' done' : '')}>{t.name}</div>
        <div className="task-meta-row">
          <span className={`priority-chip priority-${t.priority}`}>
            {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
          </span>
          {t.date && <span className="task-date">📅 {t.date}</span>}
          {t.assignee && <span className="task-assignee">👤 {t.assignee}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button className="task-del-btn" onClick={onDelete} title="Eliminar">✕</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/ProjectDetail.jsx`** (same DOM as `renderDetail`)

```jsx
import { progress, STATUS_LABELS } from '../lib/logic'
import TaskItem from './TaskItem'

export default function ProjectDetail({
  project: p, onBack, onEdit, onDelete,
  onToggleTask, onDeleteTask, onNewTask, onSaveNotes, onChangeStatus,
}) {
  const prog = progress(p.tasks)

  return (
    <>
      <div className="detail-header">
        <div className="detail-back" onClick={onBack}>← Proyectos</div>
        <div className="detail-title-block">
          <div className="detail-title">{p.name}</div>
          <div className="detail-meta">
            <span className={`badge badge-${p.type}`}>{p.type === 'obra' ? 'Obra' : 'Personal'}</span>
            <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>✏ Editar</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>✕ Eliminar</button>
        </div>
      </div>

      {p.desc && (
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>{p.desc}</div>
      )}

      <div className="detail-body">
        <div>
          <div className="tasks-panel">
            <div className="tasks-panel-header">
              <span className="tasks-panel-title">Tareas · {prog}% completado</span>
              <button className="btn btn-primary btn-sm" onClick={onNewTask}>+ Agregar tarea</button>
            </div>
            <div className="progress-bar" style={{ borderRadius: 0 }}>
              <div className="progress-fill" style={{ width: `${prog}%` }} />
            </div>
            {p.tasks.length ? p.tasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={() => onToggleTask(t.id)} onDelete={() => onDeleteTask(t.id)} />
            )) : (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <div className="empty-title">Sin tareas</div>
                <div className="empty-desc">Agregá la primera tarea del proyecto</div>
              </div>
            )}
          </div>
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-card-title">Resumen</div>
            <div className="info-row">
              <span className="info-row-label">Total tareas</span>
              <span className="info-row-val">{p.tasks.length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Completadas</span>
              <span className="info-row-val">{p.tasks.filter(t => t.done).length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Pendientes</span>
              <span className="info-row-val">{p.tasks.filter(t => !t.done).length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Alta prioridad</span>
              <span className="info-row-val">{p.tasks.filter(t => !t.done && t.priority === 'alta').length}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Creado</span>
              <span className="info-row-val">{p.createdAt}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-title">Notas</div>
            <textarea
              className="notes-area"
              placeholder="Notas, comentarios, recordatorios..."
              value={p.notes}
              onChange={e => onSaveNotes(e.target.value)}
            />
          </div>

          <div className="info-card">
            <div className="info-card-title">Estado</div>
            <select className="form-select" value={p.status} onChange={e => onChangeStatus(e.target.value)}>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="done">Finalizado</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Wire it into `src/components/Dashboard.jsx`**

Add imports at the top:
```jsx
import ProjectDetail from './ProjectDetail'
```

Add the delete handler inside the `Dashboard` function, after `handleSetView`:
```jsx
function handleDeleteProject(id) {
  if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return
  setSelectedId(null)
  data.deleteProject(id)
}
```

Replace the `<ListView ... />` element inside `<main>` with a conditional (the `loadError` branch stays as-is):
```jsx
        ) : selected ? (
          <ProjectDetail
            project={selected}
            onBack={() => setSelectedId(null)}
            onEdit={() => {}}
            onDelete={() => handleDeleteProject(selected.id)}
            onToggleTask={taskId => data.toggleTask(selected.id, taskId)}
            onDeleteTask={taskId => data.deleteTask(selected.id, taskId)}
            onNewTask={() => {}}
            onSaveNotes={notes => data.saveNotes(selected.id, notes)}
            onChangeStatus={status => data.changeStatus(selected.id, status)}
          />
        ) : (
          <ListView
            projects={data.projects}
            view={view}
            onSelect={setSelectedId}
            onNewProject={() => {}}
          />
        )}
```

- [ ] **Step 4: Verify in browser**

Manually insert a test project via MCP `execute_sql` (replace the user id with `test1@example.com`'s id from `select id from auth.users`):
```sql
insert into public.projects (user_id, name, type, status, descripcion)
values ('<USER_ID>', 'Proyecto de prueba', 'obra', 'active', 'Descripción de prueba');
insert into public.tasks (project_id, name, priority, due_date, position)
select id, 'Tarea de prueba', 'alta', '15/06', 0 from public.projects where name = 'Proyecto de prueba';
```
Reload, click the card. Expected: detail view renders; checkbox toggles (verify `done` flips in DB); notes typing persists after reload (debounce); status select updates badge + DB; delete project asks for confirmation. Compare layout with `docs/screenshots/baseline/detail-desktop.png`.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: project detail view with tasks, notes, status"
```

---

### Task 10: Modals (ProjectModal + TaskModal)

> `emilkowalski/skill` applies (see plan header). Visual design stays locked.

**Files:**
- Create: `src/components/ProjectModal.jsx`, `src/components/TaskModal.jsx`
- Modify: `src/components/Dashboard.jsx`

- [ ] **Step 1: Write `src/components/ProjectModal.jsx`** (handles both create and edit, same fields/labels as the HTML modals; empty-name behavior = focus the input, like the original)

```jsx
import { useRef, useState } from 'react'

export default function ProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name || '')
  const [desc, setDesc] = useState(project?.desc || '')
  const [type, setType] = useState(project?.type || 'obra')
  const [status, setStatus] = useState(project?.status || 'active')
  const nameRef = useRef(null)

  async function save() {
    if (!name.trim()) { nameRef.current.focus(); return }
    const ok = await onSave({ name: name.trim(), desc: desc.trim(), type, status })
    if (ok) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{project ? 'Editar proyecto' : 'Nuevo proyecto'}</div>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input ref={nameRef} className="form-input" placeholder="Ej: Obra Libertador 2460" autoFocus
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-textarea" placeholder="Detalle del proyecto..."
            value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="obra">Obra / Trabajo</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="done">Finalizado</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>
            {project ? 'Guardar cambios' : 'Guardar proyecto'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/TaskModal.jsx`**

```jsx
import { useRef, useState } from 'react'

export default function TaskModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('media')
  const [date, setDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const nameRef = useRef(null)

  async function save() {
    if (!name.trim()) { nameRef.current.focus(); return }
    const ok = await onSave({ name: name.trim(), priority, date: date.trim(), assignee: assignee.trim() })
    if (ok) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nueva tarea</div>
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <input ref={nameRef} className="form-input" placeholder="¿Qué hay que hacer?" autoFocus
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prioridad</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha límite</label>
            <input className="form-input" placeholder="dd/mm o dd/mm/aaaa"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Responsable</label>
          <input className="form-input" placeholder="Ej: Ana, yo, arquitecto..."
            value={assignee} onChange={e => setAssignee(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Agregar tarea</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire modals into `src/components/Dashboard.jsx`**

Add imports:
```jsx
import ProjectModal from './ProjectModal'
import TaskModal from './TaskModal'
```

Add modal state inside `Dashboard`, next to the other `useState` calls:
```jsx
const [modal, setModal] = useState(null)
// shapes: {kind:'new-project'} | {kind:'edit-project', project} | {kind:'new-task', projectId}
```

Replace the three `() => {}` placeholders:
- ListView: `onNewProject={() => setModal({ kind: 'new-project' })}`
- ProjectDetail: `onEdit={() => setModal({ kind: 'edit-project', project: selected })}`
- ProjectDetail: `onNewTask={() => setModal({ kind: 'new-task', projectId: selected.id })}`

Add before the closing `</div>` of `.layout`:
```jsx
      {modal?.kind === 'new-project' && (
        <ProjectModal onClose={() => setModal(null)} onSave={data.createProject} />
      )}
      {modal?.kind === 'edit-project' && (
        <ProjectModal
          project={modal.project}
          onClose={() => setModal(null)}
          onSave={fields => data.updateProject(modal.project.id, fields)}
        />
      )}
      {modal?.kind === 'new-task' && (
        <TaskModal
          onClose={() => setModal(null)}
          onSave={fields => data.addTask(modal.projectId, fields)}
        />
      )}
```

- [ ] **Step 4: Verify in browser**

Expected: "+ Nuevo proyecto" opens the modal (backdrop click closes, empty name refocuses input); saving creates the project at the top of the grid with toast "Proyecto creado ✓" and a row in the DB. Edit modal pre-fills values and saves. "+ Agregar tarea" appends a task with priority default "Media". Toasts match the original copy.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: project and task modals with full CRUD"
```

---

### Task 11: Backup export/import wiring

**Files:**
- Modify: `src/components/Dashboard.jsx`

- [ ] **Step 1: Wire the real handlers**

Add imports:
```jsx
import { parseBackup, serializeBackup, backupFilename } from '../lib/backup'
import { useToast } from '../context/ToastContext'
```

Inside `Dashboard`, add `const toast = useToast()` next to the other hooks, then add:
```jsx
function handleExport() {
  const blob = new Blob([serializeBackup(data.projects)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  a.click()
  URL.revokeObjectURL(url)
  toast('Backup exportado ✓')
}

function handleImportFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    const parsed = parseBackup(ev.target.result)
    if (!parsed) { toast('Archivo inválido'); return }
    await data.importBackup(parsed)
  }
  reader.readAsText(file)
  e.target.value = ''
}
```

Update the Sidebar props: `onExport={handleExport}` and `onImportFile={handleImportFile}`.

- [ ] **Step 2: Verify round-trip**

In the browser: "Importar backup" with `scripts/demo-data.json`. Expected: toast "Backup importado ✓", the 4 demo projects appear **in the same order as the original HTML** (Reforma casa Palermo first), counts update (Todos 4, Obras 2, Personal 2, Activos 3, Pausados 1). Then "Exportar backup" downloads `backup_proyectos_YYYYMMDD.json` whose content parses and matches.

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: JSON backup export/import (compatible with old HTML format)"
```

---

### Task 12: Visual regression check

**Files:**
- Create: `docs/screenshots/react/*.png`

- [ ] **Step 1: Capture the React app with the demo data**

The test account from Task 11 already has exactly the 4 demo projects (if extra test projects exist from Task 9/10 verification, delete them in the UI first so the data matches the baseline).

Run (dev server up):
```bash
TEST_EMAIL=test1@example.com TEST_PASSWORD=test123456 node scripts/screenshot.mjs http://localhost:5173 docs/screenshots/react
```
Expected: 6 PNGs in `docs/screenshots/react/`.

- [ ] **Step 2: Compare against baselines**

Read each pair (`baseline/list-desktop.png` vs `react/list-desktop.png`, etc. — all 6 pairs) and compare visually: layout, spacing, typography, colors, badges, progress bars, sidebar, stat cards. The only acceptable differences: the logout button in the sidebar footer (new feature) and dynamic dates.

- [ ] **Step 3: Fix any drift**

If anything differs (e.g., margin collapsing, flex differences from React fragments, font loading), fix the component markup — never the CSS — until the React DOM structure matches the HTML's. Re-capture and re-compare after each fix.

- [ ] **Step 4: Commit**

```bash
git add docs/screenshots/react/
git commit -m "test: visual regression pass — React app matches HTML baseline at 3 widths"
```

---

### Task 13: PWA — installable on iPhone

**Files:**
- Create: `scripts/make-icons.mjs`, `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Modify: `vite.config.js`, `index.html`, `package.json` (via npm install)

- [ ] **Step 1: Install the plugin**

Run: `npm install -D vite-plugin-pwa`

- [ ] **Step 2: Write `scripts/make-icons.mjs`** (renders the app icon with Playwright — blue rounded tile, white "P", DM Sans)

```js
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const html = (size) => `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; }
  .icon {
    width: ${size}px; height: ${size}px;
    background: #2B5CE6;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: ${Math.round(size * 0.52)}px;
    color: white;
    letter-spacing: -0.02em;
  }
</style></head><body><div class="icon">P</div></body></html>`

const browser = await chromium.launch()
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(html(size))
  await page.waitForTimeout(600) // font load
  await page.screenshot({ path: `public/icons/icon-${size}.png` })
  await page.close()
}
await browser.close()
console.log('Icons generated')
```

Run: `node scripts/make-icons.mjs` — Expected: `Icons generated`, both PNGs exist.

- [ ] **Step 3: Update `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gestor de Proyectos',
        short_name: 'Proyectos',
        description: 'Gestor personal de proyectos y tareas',
        lang: 'es',
        display: 'standalone',
        start_url: '/',
        background_color: '#F7F6F2',
        theme_color: '#F7F6F2',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Add iOS meta tags to `index.html`** (inside `<head>`, after the viewport meta)

```html
<meta name="theme-color" content="#F7F6F2">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Proyectos">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: `dist/manifest.webmanifest` and `dist/sw.js` exist.
Run: `npm run preview &` then `curl -s http://localhost:4173/manifest.webmanifest | head -5`
Expected: JSON with `"name": "Gestor de Proyectos"`. Kill preview.
Run: `npx vitest run` — Expected: all tests still PASS.

- [ ] **Step 6: Commit**

```bash
git add vite.config.js index.html scripts/make-icons.mjs public/ package.json package-lock.json
git commit -m "feat: PWA — installable via Safari Add to Home Screen"
```

---

### Task 14: Final pass — RLS isolation, functional checklist, README

**Files:**
- Create: `README.md`

- [ ] **Step 1: RLS isolation check**

Create a second account (`test2@example.com` / `test123456`) via the app. Expected: it sees ZERO projects (empty state), even though `test1` has 4+. Create one project as `test2`, log back in as `test1`, confirm it's not visible.

- [ ] **Step 2: Functional checklist** (run through in the browser; all must pass)

- Sidebar filters change the list + active highlight; counts correct
- Stats reflect all projects regardless of filter
- Create / edit / delete project (with confirm dialog)
- Add / toggle / delete task; progress bars update
- Notes persist after reload; status select persists
- Export downloads valid JSON; import of an old-HTML export works
- Logout returns to login; reload keeps the session
- Resize to < 640 px: sidebar hides, single-column cards (same as original)

- [ ] **Step 3: Write `README.md`**

````markdown
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
````

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: README with setup, deploy, and migration notes"
```

---

## Spec coverage map

| Spec requirement | Task |
|---|---|
| Vite + React scaffold, CSS verbatim, fonts, lang/title | 1 |
| Reference screenshots at 1280/800/375 before building | 2 |
| Schema (projects/tasks), RLS, indexes | 3 |
| Behavior-parity pure logic + backup format compat (desc→descripcion, date→due_date) | 4 |
| Toasts (same copy) | 5 |
| Auth: email+password, open signup, Spanish errors, session handling | 6 |
| Optimistic updates, debounced notes, ordering (created_at desc / position) | 7 |
| Sidebar/stats/cards/empty states, loadError retry | 8 |
| Detail view (tasks, summary, notes, status), confirm delete | 9 |
| Modals (same fields/defaults/focus behavior) | 10 |
| Backup export/import incl. old-HTML migration path | 11 |
| Visual regression vs baselines (desktop + mobile rule) | 12 |
| PWA: manifest, service worker, icons, iOS meta, HTTPS note | 13 |
| RLS isolation test with two accounts, functional pass, README | 14 |
