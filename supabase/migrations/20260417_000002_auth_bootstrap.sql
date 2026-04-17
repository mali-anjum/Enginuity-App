-- Bootstrap app data when a new auth user signs up.
-- This keeps auth -> public.users -> profile/workspace in sync.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_workspace_id uuid;
begin
  v_full_name :=
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'New User'
    );

  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    discipline,
    email_verified
  )
  values (
    new.id,
    coalesce(new.email, ''),
    v_full_name,
    new.raw_user_meta_data ->> 'avatar_url',
    'student',
    null,
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    email_verified = excluded.email_verified;

  insert into public.profiles (
    user_id,
    onboarding_completed,
    language,
    preferred_theme,
    preferences
  )
  values (
    new.id,
    false,
    'en',
    'system',
    '{}'::jsonb
  )
  on conflict (user_id) do nothing;

  insert into public.workspaces (
    owner_id,
    name,
    description,
    is_personal
  )
  values (
    new.id,
    v_full_name || '''s Workspace',
    'Auto-created personal workspace',
    true
  )
  returning id into v_workspace_id;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  values (
    v_workspace_id,
    new.id,
    'admin'
  )
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
