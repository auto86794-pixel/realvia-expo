-- Realvia: érdeklődés- és megtekintésszervező rendszer
-- Egyszer kell lefuttatni a Neon SQL Editorban.

alter table public.inquiries
  add column if not exists owner_id text,
  add column if not exists inquiry_type text not null default 'information',
  add column if not exists preferred_time_one text not null default '',
  add column if not exists preferred_time_two text not null default '',
  add column if not exists status text not null default 'new',
  add column if not exists updated_at timestamptz not null default now();

update public.inquiries i
set owner_id = p.owner_id
from public.properties p
where i.property_id = p.id
  and i.owner_id is null;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.inquiries'::regclass
      and c.contype = 'c'
      and (
        pg_get_constraintdef(c.oid) ilike '%inquiry_type%'
        or pg_get_constraintdef(c.oid) ilike '%status%'
      )
  loop
    execute format(
      'alter table public.inquiries drop constraint if exists %I',
      constraint_name
    );
  end loop;
end
$$;

alter table public.inquiries
  add constraint inquiries_type_check
    check (inquiry_type in ('viewing', 'callback', 'information')),
  add constraint inquiries_status_check
    check (status in ('new', 'contacted', 'scheduled', 'closed'));

create or replace function public.assign_inquiry_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select p.owner_id
    into new.owner_id
  from public.properties p
  where p.id = new.property_id
    and p.status in ('published', 'sold');

  if new.owner_id is null then
    raise exception 'A hirdetés nem fogad új érdeklődést.';
  end if;

  new.status := 'new';
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists inquiries_assign_owner on public.inquiries;
create trigger inquiries_assign_owner
before insert on public.inquiries
for each row execute function public.assign_inquiry_owner();

alter table public.inquiries enable row level security;

drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert
on public.inquiries for insert
to anonymous, authenticated
with check (owner_id is not null and status = 'new');

drop policy if exists inquiries_authenticated_read on public.inquiries;
drop policy if exists inquiries_owner_read on public.inquiries;
create policy inquiries_owner_read
on public.inquiries for select
to authenticated
using (owner_id = auth.user_id());

drop policy if exists inquiries_owner_update on public.inquiries;
create policy inquiries_owner_update
on public.inquiries for update
to authenticated
using (owner_id = auth.user_id())
with check (owner_id = auth.user_id());

drop policy if exists inquiries_owner_delete on public.inquiries;
create policy inquiries_owner_delete
on public.inquiries for delete
to authenticated
using (owner_id = auth.user_id());

grant insert on public.inquiries to anonymous, authenticated;
grant select, update, delete on public.inquiries to authenticated;
grant usage, select on all sequences in schema public to anonymous, authenticated;

create index if not exists inquiries_owner_id_idx
  on public.inquiries(owner_id);
create index if not exists inquiries_status_idx
  on public.inquiries(status);
create index if not exists inquiries_owner_status_idx
  on public.inquiries(owner_id, status);

notify pgrst, 'reload schema';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'inquiries'
order by ordinal_position;
