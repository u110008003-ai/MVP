drop policy if exists "Management roles can read profiles" on public.profiles;
drop policy if exists "Users can read profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
