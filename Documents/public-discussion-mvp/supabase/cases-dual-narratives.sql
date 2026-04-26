alter table public.cases
add column if not exists narrative_side_a text not null default '';

alter table public.cases
add column if not exists narrative_side_b text not null default '';

update public.cases
set narrative_side_a = narrative_timeline
where coalesce(narrative_side_a, '') = ''
  and coalesce(narrative_timeline, '') <> '';
