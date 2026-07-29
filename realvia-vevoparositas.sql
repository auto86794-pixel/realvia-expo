-- REALVIA – skálázható vevőprofil- és ingatlanpárosító rendszer
-- A teljes fájlt egyszer kell lefuttatni a Neon SQL Editorban.

create table if not exists public.buyer_profiles (
  id bigserial primary key,
  owner_id text not null,
  inquiry_id bigint references public.inquiries(id) on delete set null,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  wanted_locations text[] not null default '{}',
  property_types text[] not null default '{}',
  listing_type text not null default 'Eladó',
  min_price numeric,
  max_price numeric,
  min_bedrooms integer not null default 0,
  min_area numeric not null default 0,
  financing text not null default 'mindegy',
  move_timeline text not null default '',
  features text[] not null default '{}',
  notes text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_profiles_status_check
    check (status in ('active', 'paused', 'matched', 'archived')),
  constraint buyer_profiles_financing_check
    check (financing in ('mindegy', 'készpénz', 'hitel')),
  constraint buyer_profiles_price_check
    check (min_price is null or max_price is null or min_price <= max_price)
);

create unique index if not exists buyer_profiles_owner_inquiry_unique
  on public.buyer_profiles(owner_id, inquiry_id)
  where inquiry_id is not null;
create index if not exists buyer_profiles_owner_status_idx
  on public.buyer_profiles(owner_id, status);

create table if not exists public.property_matches (
  id bigserial primary key,
  owner_id text not null,
  buyer_profile_id bigint not null references public.buyer_profiles(id) on delete cascade,
  property_id bigint not null references public.properties(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  status text not null default 'suggested',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_matches_status_check
    check (status in ('suggested', 'sent', 'interested', 'rejected')),
  unique (buyer_profile_id, property_id)
);

create index if not exists property_matches_profile_score_idx
  on public.property_matches(buyer_profile_id, score desc);
create index if not exists property_matches_owner_status_idx
  on public.property_matches(owner_id, status);

create or replace function public.realvia_match_score(
  profile public.buyer_profiles,
  property public.properties
)
returns integer
language sql
stable
as $$
  select least(100, greatest(0,
    case
      when coalesce(array_length(profile.wanted_locations, 1), 0) = 0 then 20
      when exists (
        select 1 from unnest(profile.wanted_locations) location
        where lower(property.location) like '%' || lower(trim(location)) || '%'
      ) then 35 else 0
    end
    +
    case
      when coalesce(array_length(profile.property_types, 1), 0) = 0 then 12
      when exists (
        select 1 from unnest(profile.property_types) property_type
        where lower(property.category) = lower(trim(property_type))
      ) then 20 else 0
    end
    +
    case
      when profile.min_price is null and profile.max_price is null then 12
      when (profile.min_price is null or property.price >= profile.min_price)
       and (profile.max_price is null or property.price <= profile.max_price)
      then 20 else 0
    end
    +
    case when coalesce(property.bedrooms, 0) >= profile.min_bedrooms then 10 else 0 end
    +
    case when coalesce(property.area, 0) >= profile.min_area then 10 else 0 end
    +
    case when lower(coalesce(property.listing_type, '')) = lower(profile.listing_type) then 5 else 0 end
  ))::integer;
$$;

create or replace function public.realvia_match_reasons(
  profile public.buyer_profiles,
  property public.properties
)
returns jsonb
language sql
stable
as $$
  select to_jsonb(array_remove(array[
    case when exists (
      select 1 from unnest(profile.wanted_locations) location
      where lower(property.location) like '%' || lower(trim(location)) || '%'
    ) then 'Megfelelő helyszín' end,
    case when exists (
      select 1 from unnest(profile.property_types) property_type
      where lower(property.category) = lower(trim(property_type))
    ) then 'Keresett ingatlantípus' end,
    case when (profile.min_price is null or property.price >= profile.min_price)
           and (profile.max_price is null or property.price <= profile.max_price)
      then 'Belefér az árkeretbe' end,
    case when coalesce(property.bedrooms, 0) >= profile.min_bedrooms
      then 'Megfelelő szobaszám' end,
    case when coalesce(property.area, 0) >= profile.min_area
      then 'Megfelelő alapterület' end
  ], null));
$$;

create or replace function public.refresh_matches_for_profile(profile_key bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.property_matches (
    owner_id, buyer_profile_id, property_id, score, reasons, updated_at
  )
  select
    bp.owner_id,
    bp.id,
    p.id,
    public.realvia_match_score(bp, p),
    public.realvia_match_reasons(bp, p),
    now()
  from public.buyer_profiles bp
  join public.properties p
    on p.owner_id = bp.owner_id
   and p.status = 'published'
  where bp.id = profile_key
    and bp.status = 'active'
    and public.realvia_match_score(bp, p) >= 35
  on conflict (buyer_profile_id, property_id)
  do update set
    score = excluded.score,
    reasons = excluded.reasons,
    updated_at = now();

  delete from public.property_matches pm
  where pm.buyer_profile_id = profile_key
    and pm.status = 'suggested'
    and not exists (
      select 1
      from public.buyer_profiles bp
      join public.properties p on p.id = pm.property_id
      where bp.id = profile_key
        and bp.status = 'active'
        and p.status = 'published'
        and public.realvia_match_score(bp, p) >= 35
    );
end;
$$;

create or replace function public.refresh_matches_for_property(property_key bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_key bigint;
begin
  for profile_key in
    select bp.id
    from public.buyer_profiles bp
    join public.properties p on p.owner_id = bp.owner_id
    where p.id = property_key and bp.status = 'active'
  loop
    perform public.refresh_matches_for_profile(profile_key);
  end loop;
end;
$$;

create or replace function public.buyer_profiles_refresh_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  perform public.refresh_matches_for_profile(new.id);
  return new;
end;
$$;

create or replace function public.properties_refresh_matches_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_matches_for_property(new.id);
  return new;
end;
$$;

drop trigger if exists buyer_profiles_refresh_matches on public.buyer_profiles;
create trigger buyer_profiles_refresh_matches
after insert or update on public.buyer_profiles
for each row execute function public.buyer_profiles_refresh_trigger();

drop trigger if exists properties_refresh_matches on public.properties;
create trigger properties_refresh_matches
after insert or update on public.properties
for each row execute function public.properties_refresh_matches_trigger();

alter table public.buyer_profiles enable row level security;
alter table public.property_matches enable row level security;

drop policy if exists buyer_profiles_owner_all on public.buyer_profiles;
create policy buyer_profiles_owner_all
on public.buyer_profiles for all
to authenticated
using (owner_id = auth.user_id())
with check (owner_id = auth.user_id());

drop policy if exists property_matches_owner_all on public.property_matches;
create policy property_matches_owner_all
on public.property_matches for all
to authenticated
using (owner_id = auth.user_id())
with check (owner_id = auth.user_id());

grant select, insert, update, delete on public.buyer_profiles to authenticated;
grant select, insert, update, delete on public.property_matches to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- A korábban létrehozott aktív profilokra is elkészíti a találatokat.
do $$
declare profile_key bigint;
begin
  for profile_key in select id from public.buyer_profiles where status = 'active'
  loop
    perform public.refresh_matches_for_profile(profile_key);
  end loop;
end
$$;

notify pgrst, 'reload schema';

select 'A Realvia vevőpárosító rendszere elkészült.' as eredmeny;
