-- Harden auth bootstrap for providers that do not return an email.
-- Keep users.email unique/not-null without using a shared empty string fallback.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_workspace_id uuid;
  v_email text;
  v_is_placeholder_email boolean;
begin
  v_email := coalesce(
    nullif(trim(new.email), ''),
    new.id::text || '@placeholder.local'
  );
  v_is_placeholder_email := v_email like '%@placeholder.local';

  v_full_name :=
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(v_email, '@', 1),
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
    v_email,
    v_full_name,
    new.raw_user_meta_data ->> 'avatar_url',
    'student',
    null,
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do update
  set
    email = case
      when v_is_placeholder_email then public.users.email
      else excluded.email
    end,
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
