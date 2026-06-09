-- Migration: create_projects_and_tasks
-- Paste into: https://supabase.com/dashboard/project/swbuspejkozzyqalpncn/sql/new

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
