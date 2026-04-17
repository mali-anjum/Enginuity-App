-- Full-text search across synced projects, experiments, and notes (respects existing RLS via SECURITY INVOKER).

create index if not exists idx_projects_search_fts
  on public.projects using gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  );

create index if not exists idx_experiments_search_fts
  on public.experiments using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(objective, '') || ' ' || coalesce(observations, '')
    )
  );

create index if not exists idx_notes_search_fts
  on public.notes using gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );

create or replace function public.global_search_entities(
  search_query text,
  filter_project_id uuid default null,
  filter_status text default null,
  filter_hardware_id uuid default null,
  filter_tag text default null,
  date_from date default null,
  date_to date default null,
  result_limit int default 80
)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  rank double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select * from (
    (
      select
        'project'::text as entity_type,
        p.id as entity_id,
        p.title as title,
        ts_rank_cd(
          to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '')),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision as rank
      from public.projects p
      where length(trim(coalesce(search_query, ''))) > 0
        and to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, ''))
          @@ websearch_to_tsquery('english', trim(search_query))
        and (filter_project_id is null or p.id = filter_project_id)
        and (
          filter_status is null
          or trim(filter_status) = ''
          or (
            lower(trim(filter_status)) in ('active', 'completed', 'archived')
            and p.status::text = lower(trim(filter_status))
          )
        )
        and (date_from is null or (p.updated_at at time zone 'utc')::date >= date_from)
        and (date_to is null or (p.updated_at at time zone 'utc')::date <= date_to)
      order by rank desc
      limit greatest(1, least(coalesce(result_limit, 80), 200))
    )
    union all
    (
      select
        'experiment'::text,
        e.id,
        e.title,
        ts_rank_cd(
          to_tsvector(
            'english',
            coalesce(e.title, '') || ' ' || coalesce(e.objective, '') || ' ' || coalesce(e.observations, '')
          ),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision
      from public.experiments e
      where length(trim(coalesce(search_query, ''))) > 0
        and to_tsvector(
          'english',
          coalesce(e.title, '') || ' ' || coalesce(e.objective, '') || ' ' || coalesce(e.observations, '')
        )
          @@ websearch_to_tsquery('english', trim(search_query))
        and (filter_project_id is null or e.project_id = filter_project_id)
        and (
          filter_hardware_id is null
          or exists (
            select 1
            from public.experiment_hardware eh
            where eh.experiment_id = e.id
              and eh.hardware_id = filter_hardware_id
          )
        )
        and (
          filter_status is null
          or trim(filter_status) = ''
          or (
            lower(trim(filter_status)) in ('pending', 'in_progress', 'completed', 'failed')
            and e.status::text = lower(trim(filter_status))
          )
        )
        and (date_from is null or (e.updated_at at time zone 'utc')::date >= date_from)
        and (date_to is null or (e.updated_at at time zone 'utc')::date <= date_to)
      order by rank desc
      limit greatest(1, least(coalesce(result_limit, 80), 200))
    )
    union all
    (
      select
        'note'::text,
        n.id,
        n.title,
        ts_rank_cd(
          to_tsvector('english', coalesce(n.title, '') || ' ' || coalesce(n.body, '')),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision
      from public.notes n
      where length(trim(coalesce(search_query, ''))) > 0
        and to_tsvector('english', coalesce(n.title, '') || ' ' || coalesce(n.body, ''))
          @@ websearch_to_tsquery('english', trim(search_query))
        and (filter_project_id is null or n.project_id = filter_project_id)
        and (
          filter_tag is null
          or trim(filter_tag) = ''
          or exists (
            select 1
            from public.entity_tags et
            join public.tags tg on tg.id = et.tag_id
            where et.entity_type = 'note'
              and et.entity_id = n.id
              and lower(tg.name) = lower(trim(filter_tag))
          )
        )
        and (date_from is null or (n.updated_at at time zone 'utc')::date >= date_from)
        and (date_to is null or (n.updated_at at time zone 'utc')::date <= date_to)
      order by rank desc
      limit greatest(1, least(coalesce(result_limit, 80), 200))
    )
  ) hits;
$$;

grant execute on function public.global_search_entities(
  text,
  uuid,
  text,
  uuid,
  text,
  date,
  date,
  int
) to authenticated;
