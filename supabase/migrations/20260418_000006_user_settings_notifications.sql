-- Notification preferences persisted per user (Supabase). Theme remains client-side (Redux uiSlice).

create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  push_notifications_enabled boolean not null default true,
  email_notifications_enabled boolean not null default true,
  experiment_reminders_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings_select_own" on public.user_settings
for select using (auth.uid() = user_id);

create policy "user_settings_insert_own" on public.user_settings
for insert with check (auth.uid() = user_id);

create policy "user_settings_update_own" on public.user_settings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
