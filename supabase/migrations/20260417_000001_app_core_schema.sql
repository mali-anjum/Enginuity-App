-- Enginuity app core schema
-- Aligned with src modules:
-- auth, onboarding, dashboard, workspace, knowledge, profile, sharedModules

-- =====================================================
-- EXTENSIONS
-- =====================================================
create extension if not exists "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================
create type public.app_role as enum ('student', 'researcher', 'educator');
create type public.discipline_type as enum (
  'mechanical',
  'electrical',
  'civil',
  'software',
  'chemical',
  'other'
);
create type public.workspace_member_role as enum ('admin', 'member', 'viewer');
create type public.project_status as enum ('active', 'completed', 'archived');
create type public.priority_level as enum ('low', 'medium', 'high', 'critical');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.hardware_category as enum ('MCU', 'Sensor', 'Actuator', 'Module', 'Tool');
create type public.hardware_status as enum ('available', 'in_use', 'maintenance', 'depleted');
create type public.experiment_status as enum ('pending', 'in_progress', 'completed', 'failed');
create type public.note_type as enum ('general', 'lab', 'theory', 'code');
create type public.entity_tag_type as enum ('note', 'experiment', 'task', 'project');
create type public.reminder_status as enum ('pending', 'sent', 'dismissed');
create type public.subscription_plan as enum ('free', 'pro', 'team');
create type public.billing_cycle as enum ('monthly', 'yearly');
create type public.payment_status as enum ('pending', 'succeeded', 'failed');
create type public.payment_provider as enum ('stripe', 'apple', 'google');
create type public.sync_operation as enum ('create', 'update', 'delete');
create type public.sync_status as enum ('pending', 'synced', 'failed');
create type public.ai_request_type as enum ('summary', 'tag_suggestion', 'code_analysis');

-- =====================================================
-- SHARED HELPERS
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The app should map identity to Supabase auth.users directly.
-- This keeps auth synchronized with profile/workspace ownership.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role public.app_role not null default 'student',
  discipline public.discipline_type default null,
  is_active boolean not null default true,
  is_new_user boolean not null default true,
  internet_reachable boolean not null default true,
  email_verified boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  bio text,
  institution text,
  field_of_study text,
  timezone text,
  language text default 'en',
  preferred_theme text not null default 'system',
  onboarding_completed boolean not null default false,
  storage_used_mb numeric(12,2) not null default 0,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  is_personal boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.workspace_member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  status public.project_status not null default 'active',
  priority public.priority_level not null default 'medium',
  start_date timestamptz,
  due_date timestamptz,
  is_favorite boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.priority_level not null default 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hardware_library (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category public.hardware_category not null,
  manufacturer text,
  model_number text,
  specifications text,
  datasheet_url text,
  quantity_available int not null default 1 check (quantity_available >= 0),
  quantity_in_use int not null default 0 check (quantity_in_use >= 0),
  status public.hardware_status not null default 'available',
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  objective text,
  observations text,
  status public.experiment_status not null default 'pending',
  github_commit text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiment_hardware (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  hardware_id uuid not null references public.hardware_library(id) on delete cascade,
  quantity_used int not null default 1 check (quantity_used > 0),
  unique (experiment_id, hardware_id)
);

create table if not exists public.experiment_attachments (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  file_name text not null,
  file_type text,
  storage_path text not null,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  experiment_id uuid references public.experiments(id) on delete set null,
  title text not null,
  body text,
  note_type public.note_type not null default 'general',
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  body text,
  version_number int not null check (version_number > 0),
  created_at timestamptz not null default now(),
  unique (note_id, version_number)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.entity_tags (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  entity_type public.entity_tag_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tag_id, entity_type, entity_id)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  experiment_id uuid references public.experiments(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  remind_at timestamptz not null,
  status public.reminder_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status text not null default 'active',
  billing_cycle public.billing_cycle not null default 'monthly',
  starts_at timestamptz,
  ends_at timestamptz,
  provider public.payment_provider,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider_payment_id text,
  amount numeric(12,2),
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  operation public.sync_operation not null,
  status public.sync_status not null default 'pending',
  payload jsonb,
  retry_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  action text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  metric_type text,
  metric_value int,
  recorded_at timestamptz not null default now()
);

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  request_type public.ai_request_type,
  tokens_used int,
  status text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- INDEXES
-- =====================================================
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_is_new_user on public.users(is_new_user);
create index if not exists idx_projects_workspace on public.projects(workspace_id);
create index if not exists idx_projects_owner on public.projects(owner_id);
create index if not exists idx_experiments_project on public.experiments(project_id);
create index if not exists idx_experiments_status on public.experiments(status);
create index if not exists idx_notes_owner on public.notes(owner_id);
create index if not exists idx_notes_project on public.notes(project_id);
create index if not exists idx_hardware_owner on public.hardware_library(owner_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_assigned on public.tasks(assigned_to);
create index if not exists idx_sync_queue_status on public.sync_queue(status, user_id);
create index if not exists idx_activity_logs_user on public.activity_logs(user_id, created_at);
create index if not exists idx_entity_tags_lookup on public.entity_tags(entity_type, entity_id);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger trg_hardware_updated_at
before update on public.hardware_library
for each row execute function public.set_updated_at();

create trigger trg_experiments_updated_at
before update on public.experiments
for each row execute function public.set_updated_at();

create trigger trg_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- =====================================================
-- RLS HELPERS
-- =====================================================
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
  );
$$;

-- =====================================================
-- RLS
-- =====================================================
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.hardware_library enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_hardware enable row level security;
alter table public.experiment_attachments enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.tags enable row level security;
alter table public.entity_tags enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.sync_queue enable row level security;
alter table public.activity_logs enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.ai_requests enable row level security;

-- Users / profiles
create policy "users_select_self" on public.users
for select using (auth.uid() = id);
create policy "users_update_self" on public.users
for update using (auth.uid() = id);
create policy "users_insert_self" on public.users
for insert with check (auth.uid() = id);

create policy "profiles_owner_all" on public.profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Workspace
create policy "workspaces_member_select" on public.workspaces
for select using (public.is_workspace_member(id) or owner_id = auth.uid());
create policy "workspaces_owner_all" on public.workspaces
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workspace_members_select_member" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));
create policy "workspace_members_owner_manage" on public.workspace_members
for all using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()
  )
);

-- Project / task / experiment / notes hierarchy
create policy "projects_workspace_members_select" on public.projects
for select using (public.is_workspace_member(workspace_id) or owner_id = auth.uid());
create policy "projects_workspace_members_modify" on public.projects
for all using (public.is_workspace_member(workspace_id) or owner_id = auth.uid())
with check (public.is_workspace_member(workspace_id) or owner_id = auth.uid());

create policy "tasks_project_access" on public.tasks
for all using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
) with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
);

create policy "experiments_project_access" on public.experiments
for all using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
) with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
);

create policy "notes_owner_or_project_access" on public.notes
for all using (
  owner_id = auth.uid()
  or (
    project_id is not null
    and exists (
      select 1
      from public.projects p
      where p.id = project_id
        and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
    )
  )
) with check (
  owner_id = auth.uid()
  or (
    project_id is not null
    and exists (
      select 1
      from public.projects p
      where p.id = project_id
        and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
    )
  )
);

create policy "note_versions_follow_note_access" on public.note_versions
for all using (
  exists (
    select 1
    from public.notes n
    where n.id = note_id
      and (
        n.owner_id = auth.uid()
        or (
          n.project_id is not null
          and exists (
            select 1
            from public.projects p
            where p.id = n.project_id
              and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
          )
        )
      )
  )
) with check (
  exists (
    select 1
    from public.notes n
    where n.id = note_id
      and (
        n.owner_id = auth.uid()
        or (
          n.project_id is not null
          and exists (
            select 1
            from public.projects p
            where p.id = n.project_id
              and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
          )
        )
      )
  )
);

-- Knowledge + tagging
create policy "tags_workspace_access" on public.tags
for all using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "entity_tags_by_tag_access" on public.entity_tags
for all using (
  exists (
    select 1 from public.tags t
    where t.id = tag_id and public.is_workspace_member(t.workspace_id)
  )
) with check (
  exists (
    select 1 from public.tags t
    where t.id = tag_id and public.is_workspace_member(t.workspace_id)
  )
);

-- Hardware
create policy "hardware_owner_all" on public.hardware_library
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "experiment_hardware_access" on public.experiment_hardware
for all using (
  exists (
    select 1 from public.experiments e
    join public.projects p on p.id = e.project_id
    where e.id = experiment_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.experiments e
    join public.projects p on p.id = e.project_id
    where e.id = experiment_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
);

create policy "experiment_attachments_access" on public.experiment_attachments
for all using (
  exists (
    select 1 from public.experiments e
    join public.projects p on p.id = e.project_id
    where e.id = experiment_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.experiments e
    join public.projects p on p.id = e.project_id
    where e.id = experiment_id
      and (public.is_workspace_member(p.workspace_id) or p.owner_id = auth.uid())
  )
);

-- User-private modules
create policy "reminders_owner_all" on public.reminders
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_owner_all" on public.notifications
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subscriptions_owner_all" on public.subscriptions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "payments_owner_all" on public.payments
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sync_queue_owner_all" on public.sync_queue
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "activity_logs_owner_all" on public.activity_logs
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "usage_metrics_owner_all" on public.usage_metrics
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ai_requests_owner_all" on public.ai_requests
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
