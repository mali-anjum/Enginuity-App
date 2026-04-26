-- Fix workspace_members RLS recursion and statement timeouts.
-- Symptoms addressed:
-- - 500 on /rest/v1/workspace_members
-- - statement timeout (57014) during tag seeding and workspace lookups

-- Use a SECURITY DEFINER helper so membership checks do not recurse through RLS on workspace_members.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

-- Previous select policy referenced is_workspace_member(workspace_id) on the same table,
-- which can recurse. Replace it with a non-recursive predicate.
drop policy if exists "workspace_members_select_member" on public.workspace_members;

create policy "workspace_members_select_member" on public.workspace_members
for select using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.workspaces w
    where w.id = workspace_id
      and w.owner_id = auth.uid()
  )
);
