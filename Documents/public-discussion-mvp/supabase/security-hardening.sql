-- Security hardening for public-discussion-mvp
-- Run this after the existing schema files to replace overly broad policies.

alter table if exists public.profiles enable row level security;
alter table if exists public.cases enable row level security;
alter table if exists public.proposals enable row level security;
alter table if exists public.submissions enable row level security;
alter table if exists public.revisions enable row level security;

revoke all on public.profiles from anon;
revoke all on public.cases from anon;
revoke all on public.proposals from anon;
revoke all on public.submissions from anon;
revoke all on public.revisions from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.cases to authenticated;
grant select, insert, update on public.proposals to authenticated;
grant select, insert, update on public.submissions to authenticated;
grant select, insert on public.revisions to authenticated;

drop policy if exists "Users can read profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Management roles can read profiles" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone can read proposals" on public.proposals;
drop policy if exists "Level 2 can insert proposals" on public.proposals;
drop policy if exists "Level 1 can insert proposals" on public.proposals;
drop policy if exists "Author or Level 4 can update draft proposals" on public.proposals;
drop policy if exists "Level 3 can promote proposals" on public.proposals;
drop policy if exists "Authors and moderators can read proposals" on public.proposals;

create policy "Authors and moderators can read proposals"
on public.proposals
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

create policy "Level 1 can insert proposals"
on public.proposals
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_1', 'level_2', 'level_3', 'level_4')
  )
);

create policy "Author or Level 4 can update draft proposals"
on public.proposals
for update
to authenticated
using (
  status = 'under_review'
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'level_4'
    )
  )
)
with check (
  status = 'under_review'
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'level_4'
    )
  )
);

create policy "Level 3 can promote proposals"
on public.proposals
for update
to authenticated
using (
  status = 'under_review'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
)
with check (
  status = 'promoted'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

drop policy if exists "Anyone can read submissions" on public.submissions;
drop policy if exists "Anyone can insert submissions" on public.submissions;
drop policy if exists "Anyone can update submissions" on public.submissions;
drop policy if exists "Authenticated users can create own submissions" on public.submissions;
drop policy if exists "Authors and moderators can read submissions" on public.submissions;
drop policy if exists "Moderators can update submissions" on public.submissions;

create policy "Authenticated users can create own submissions"
on public.submissions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
  )
);

create policy "Authors and moderators can read submissions"
on public.submissions
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

create policy "Moderators can update submissions"
on public.submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

drop policy if exists "Anyone can read revisions" on public.revisions;
drop policy if exists "Anyone can insert revisions" on public.revisions;
drop policy if exists "Management roles can read revisions" on public.revisions;
drop policy if exists "Level 4 can insert revisions" on public.revisions;

create policy "Management roles can read revisions"
on public.revisions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

create policy "Level 4 can insert revisions"
on public.revisions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);

drop policy if exists "Anyone can read cases" on public.cases;
drop policy if exists "Management roles can read cases" on public.cases;
drop policy if exists "Level 3 can insert cases" on public.cases;
drop policy if exists "Level 4 can update cases" on public.cases;
drop policy if exists "Level 4 can delete cases" on public.cases;

create policy "Management roles can read cases"
on public.cases
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

create policy "Level 3 can insert cases"
on public.cases
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);

create policy "Level 4 can update cases"
on public.cases
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);

create policy "Level 4 can delete cases"
on public.cases
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);

drop view if exists public.profile_public_names;

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

create or replace view public.public_proposals
with (security_barrier = true) as
select
  p.id,
  p.title,
  p.content,
  p.status,
  p.promoted_case_id,
  p.created_at,
  p.updated_at,
  author.display_name as author_display_name,
  reviewer.display_name as reviewer_display_name
from public.proposals as p
left join public.profiles as author on author.id = p.user_id
left join public.profiles as reviewer on reviewer.id = p.reviewed_by;

create or replace view public.public_accepted_submissions
with (security_barrier = true) as
select
  s.id,
  s.case_id,
  s.type,
  s.content,
  s.source_url,
  s.created_at
from public.submissions as s
join public.cases as c on c.id = s.case_id
where s.status = 'accepted'
  and c.status = 'formal';

create or replace view public.public_case_revisions
with (security_barrier = true) as
select
  r.id,
  r.case_id,
  r.summary,
  r.detail,
  r.created_at
from public.revisions as r
join public.cases as c on c.id = r.case_id
where c.status = 'formal';

revoke all on public.public_cases from public;
revoke all on public.public_proposals from public;
revoke all on public.public_accepted_submissions from public;
revoke all on public.public_case_revisions from public;

grant select on public.public_cases to anon, authenticated;
grant select on public.public_proposals to anon, authenticated;
grant select on public.public_accepted_submissions to anon, authenticated;
grant select on public.public_case_revisions to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('case-assets', 'case-assets', true)
on conflict (id) do update
set public = true;

drop policy if exists "Anyone can view case assets" on storage.objects;
drop policy if exists "Level 4 can upload case assets" on storage.objects;
drop policy if exists "Level 4 can update case assets" on storage.objects;
drop policy if exists "Level 4 can delete case assets" on storage.objects;

create policy "Level 4 can upload case assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'case-assets'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);

create policy "Level 4 can update case assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'case-assets'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
)
with check (
  bucket_id = 'case-assets'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);

create policy "Level 4 can delete case assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'case-assets'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'level_4'
  )
);
