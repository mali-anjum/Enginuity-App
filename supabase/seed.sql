-- Development seed data.
-- Safe to run multiple times; inserts only if at least one app user exists.

with first_user as (
  select id, full_name
  from public.users
  order by created_at asc
  limit 1
),
first_workspace as (
  select w.id as workspace_id, fu.id as user_id
  from first_user fu
  join public.workspaces w on w.owner_id = fu.id
  order by w.created_at asc
  limit 1
),
insert_project as (
  insert into public.projects (
    workspace_id,
    owner_id,
    title,
    description,
    status,
    priority
  )
  select
    fw.workspace_id,
    fw.user_id,
    'Getting Started Project',
    'Starter project seeded for local development.',
    'active',
    'medium'
  from first_workspace fw
  where not exists (
    select 1 from public.projects p
    where p.workspace_id = fw.workspace_id
      and p.title = 'Getting Started Project'
  )
  returning id, owner_id
),
project_row as (
  select id as project_id, owner_id as user_id from insert_project
  union all
  select p.id, p.owner_id
  from first_workspace fw
  join public.projects p on p.workspace_id = fw.workspace_id
  where p.title = 'Getting Started Project'
  order by p.created_at asc
  limit 1
),
insert_task as (
  insert into public.tasks (
    project_id,
    assigned_to,
    title,
    description,
    status,
    priority
  )
  select
    pr.project_id,
    pr.user_id,
    'Complete onboarding',
    'Finish onboarding flow and confirm discipline selection.',
    'todo',
    'high'
  from project_row pr
  where not exists (
    select 1 from public.tasks t
    where t.project_id = pr.project_id
      and t.title = 'Complete onboarding'
  )
)
insert into public.notes (
  owner_id,
  project_id,
  title,
  body,
  note_type
)
select
  pr.user_id,
  pr.project_id,
  'Welcome note',
  'This is seeded data for local development.',
  'general'
from project_row pr
where not exists (
  select 1 from public.notes n
  where n.project_id = pr.project_id
    and n.title = 'Welcome note'
);

with first_workspace as (
  select w.id as workspace_id
  from public.workspaces w
  order by w.created_at asc
  limit 1
)
insert into public.tags (workspace_id, name, color)
select
  fw.workspace_id,
  seeded.name,
  seeded.color
from first_workspace fw
cross join (
  values
    ('PID', '#0EA5E9'),
    ('I2C', '#14B8A6'),
    ('SPI', '#6366F1'),
    ('UART', '#EC4899'),
    ('PWM', '#F97316'),
    ('Kalman Filter', '#22C55E'),
    ('Arduino', '#A855F7'),
    ('ESP32', '#EAB308'),
    ('MPU6050', '#06B6D4'),
    ('STM32', '#3B82F6'),
    ('ROS', '#0EA5E9'),
    ('MATLAB', '#14B8A6'),
    ('Python', '#6366F1'),
    ('C++', '#EC4899'),
    ('Bluetooth', '#F97316'),
    ('WiFi', '#22C55E'),
    ('LoRa', '#A855F7')
) as seeded(name, color)
where fw.workspace_id is not null
on conflict (workspace_id, name) do update
set color = excluded.color;
