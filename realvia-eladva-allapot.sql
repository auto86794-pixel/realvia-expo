-- Realvia: az "Eladva" hirdetésállapot engedélyezése
-- Ezt egyszer kell lefuttatni a Neon SQL Editorban.

alter table public.properties
  drop constraint if exists properties_status_check;

alter table public.properties
  add constraint properties_status_check
  check (status in ('draft', 'published', 'inactive', 'sold'));

drop policy if exists properties_public_read on public.properties;
create policy properties_public_read
on public.properties for select
to anonymous
using (status in ('published', 'sold'));

drop policy if exists properties_authenticated_read on public.properties;
create policy properties_authenticated_read
on public.properties for select
to authenticated
using (
  status in ('published', 'sold')
  or owner_id = auth.user_id()
);
