-- Align profile module data with profiles table.
-- Stores name, discipline, avatar, and bio directly in profiles.

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists discipline public.discipline_type,
  add column if not exists avatar_url text;

update public.profiles p
set
  full_name = coalesce(p.full_name, u.full_name),
  discipline = coalesce(p.discipline, u.discipline),
  avatar_url = coalesce(p.avatar_url, u.avatar_url)
from public.users u
where u.id = p.user_id;
