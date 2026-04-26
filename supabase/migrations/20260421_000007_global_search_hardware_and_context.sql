-- v0.3 SPARK: expand global FTS to include hardware + project context + snippets

drop function if exists public.global_search_entities(
  text,
  uuid,
  text,
  uuid,
  text,
  date,
  date,
  int
);

create index if not exists idx_hardware_search_fts
  on public.hardware_library using gin (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(specifications, ''))
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
  project_id uuid,
  project_title text,
  snippet text,
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
        'experiment'::text as entity_type,
        e.id as entity_id,
        e.title as title,
        p.id as project_id,
        p.title as project_title,
        ts_headline(
          'english',
          coalesce(e.observations, coalesce(e.objective, e.title)),
          websearch_to_tsquery('english', trim(search_query))
        ) as snippet,
        ts_rank_cd(
          to_tsvector(
            'english',
            coalesce(e.title, '') || ' ' || coalesce(e.objective, '') || ' ' || coalesce(e.observations, '')
          ),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision as rank
      from public.experiments e
      join public.projects p on p.id = e.project_id
      where length(trim(coalesce(search_query, ''))) > 0
        and to_tsvector(
          'english',
          coalesce(e.title, '') || ' ' || coalesce(e.objective, '') || ' ' || coalesce(e.observations, '')
        ) @@ websearch_to_tsquery('english', trim(search_query))
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
        'note'::text as entity_type,
        n.id as entity_id,
        n.title as title,
        p.id as project_id,
        p.title as project_title,
        ts_headline(
          'english',
          coalesce(n.body, n.title),
          websearch_to_tsquery('english', trim(search_query))
        ) as snippet,
        ts_rank_cd(
          to_tsvector('english', coalesce(n.title, '') || ' ' || coalesce(n.body, '')),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision as rank
      from public.notes n
      left join public.projects p on p.id = n.project_id
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
    union all
    (
      select
        'hardware'::text as entity_type,
        h.id as entity_id,
        h.name as title,
        p.id as project_id,
        p.title as project_title,
        ts_headline(
          'english',
          coalesce(h.specifications, h.name),
          websearch_to_tsquery('english', trim(search_query))
        ) as snippet,
        ts_rank_cd(
          to_tsvector('english', coalesce(h.name, '') || ' ' || coalesce(h.specifications, '')),
          websearch_to_tsquery('english', trim(search_query))
        )::double precision as rank
      from public.hardware_library h
      left join lateral (
        select p1.id, p1.title
        from public.experiment_hardware eh
        join public.experiments e on e.id = eh.experiment_id
        join public.projects p1 on p1.id = e.project_id
        where eh.hardware_id = h.id
        order by e.updated_at desc
        limit 1
      ) p on true
      where length(trim(coalesce(search_query, ''))) > 0
        and to_tsvector('english', coalesce(h.name, '') || ' ' || coalesce(h.specifications, ''))
          @@ websearch_to_tsquery('english', trim(search_query))
        and (
          filter_project_id is null
          or exists (
            select 1
            from public.experiment_hardware eh2
            join public.experiments e2 on e2.id = eh2.experiment_id
            where eh2.hardware_id = h.id
              and e2.project_id = filter_project_id
          )
        )
        and (date_from is null or (h.updated_at at time zone 'utc')::date >= date_from)
        and (date_to is null or (h.updated_at at time zone 'utc')::date <= date_to)
      order by rank desc
      limit greatest(1, least(coalesce(result_limit, 80), 200))
    )
  ) hits;
$$;
