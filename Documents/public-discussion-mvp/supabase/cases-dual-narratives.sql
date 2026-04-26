alter table public.cases
add column if not exists narrative_side_a text not null default '';

alter table public.cases
add column if not exists narrative_side_b text not null default '';

update public.cases
set narrative_side_a = narrative_timeline
where coalesce(narrative_side_a, '') = ''
  and coalesce(narrative_timeline, '') <> '';

create or replace view public.public_cases
with (security_barrier = true) as
select
  c.id,
  c.title,
  c.question,
  c.narrative_timeline,
  c.stable_conclusion,
  c.confirmed_facts,
  c.possible_explanations,
  c.unsupported_claims,
  c.evidence_list,
  c.reference_links,
  c.open_questions,
  c.summary_image_url,
  c.summary_image_note,
  c.status,
  c.updated_at,
  creator.display_name as created_by_display_name,
  promoter.display_name as promoted_by_display_name,
  c.narrative_side_a,
  c.narrative_side_b
from public.cases as c
left join public.profiles as creator on creator.id = c.created_by
left join public.profiles as promoter on promoter.id = c.promoted_by
where c.status = 'formal';
