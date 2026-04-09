insert into storage.buckets (id, name, public)
values ('case-assets', 'case-assets', true)
on conflict (id) do update
set public = true;

create policy "Anyone can view case assets"
on storage.objects
for select
to public
using (bucket_id = 'case-assets');

create policy "Level 3 can upload case assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'case-assets'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('level_3', 'level_4')
  )
);
