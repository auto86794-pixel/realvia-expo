-- Realvia ügyfélkezelő frissítés
-- A teljes tartalom egyszer futtatható a Neon SQL Editorban.
-- Megőrzi a meglévő érdeklődéseket, és hozzáadja a "Sikeres" állapotot.

alter table public.inquiries
  add column if not exists status text not null default 'new',
  add column if not exists read_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.inquiries'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format(
      'alter table public.inquiries drop constraint if exists %I',
      constraint_name
    );
  end loop;
end
$$;

alter table public.inquiries
  add constraint inquiries_status_check
  check (
    status in (
      'new',
      'contacted',
      'scheduled',
      'successful',
      'closed'
    )
  );

create index if not exists inquiries_owner_status_idx
  on public.inquiries(owner_id, status);

notify pgrst, 'reload schema';

select
  conname as constraint_name,
  pg_get_constraintdef(oid) as active_rule
from pg_constraint
where conrelid = 'public.inquiries'::regclass
  and contype = 'c'
  and pg_get_constraintdef(oid) ilike '%status%';
