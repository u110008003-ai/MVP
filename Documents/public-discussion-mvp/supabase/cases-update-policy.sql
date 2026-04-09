drop policy if exists "Anyone can update cases" on public.cases;
create policy "Anyone can update cases"
on public.cases
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Anyone can delete cases" on public.cases;
create policy "Anyone can delete cases"
on public.cases
for delete
to anon, authenticated
using (true);
