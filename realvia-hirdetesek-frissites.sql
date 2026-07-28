-- Realvia: saját és nyilvános hirdetések biztonságos működése
-- Ezt egyszer kell lefuttatni a Neon SQL Editorban.

alter table public.properties
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'published', 'inactive')),
  add column if not exists listing_type text not null default 'Eladó';

drop policy if exists properties_public_read on public.properties;
create policy properties_public_read
on public.properties for select
to anonymous
using (status = 'published');

drop policy if exists properties_authenticated_read on public.properties;
create policy properties_authenticated_read
on public.properties for select
to authenticated
using (status = 'published' or owner_id = auth.user_id());

drop policy if exists properties_authenticated_insert on public.properties;
create policy properties_authenticated_insert
on public.properties for insert
to authenticated
with check (owner_id = auth.user_id());

drop policy if exists properties_authenticated_update on public.properties;
create policy properties_authenticated_update
on public.properties for update
to authenticated
using (owner_id = auth.user_id())
with check (owner_id = auth.user_id());

drop policy if exists properties_authenticated_delete on public.properties;
create policy properties_authenticated_delete
on public.properties for delete
to authenticated
using (owner_id = auth.user_id());

create index if not exists properties_owner_id_idx
  on public.properties(owner_id);
create index if not exists properties_status_idx
  on public.properties(status);
