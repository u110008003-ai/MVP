create extension if not exists pgcrypto;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  content text not null,
  status text not null default 'under_review' check (status in ('under_review', 'promoted')),
  promoted_case_id uuid references public.cases(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.proposals
  add column if not exists promoted_case_id uuid references public.cases(id) on delete set null;

alter table public.proposals
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.proposals enable row level security;

drop policy if exists "Anyone can read proposals" on public.proposals;
create policy "Anyone can read proposals"
on public.proposals
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can insert proposals" on public.proposals;
create policy "Anyone can insert proposals"
on public.proposals
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can update proposals" on public.proposals;
create policy "Anyone can update proposals"
on public.proposals
for update
to anon, authenticated
using (true)
with check (true);
