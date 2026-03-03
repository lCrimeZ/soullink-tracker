create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default 'SoulLink Run',
  game text not null default 'FireRed',
  gen int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  idx int not null check (idx in (1,2)),
  name text not null,
  avatar_url text,
  deaths int not null default 0,
  wipes int not null default 0,
  unique(run_id, idx)
);

create table if not exists level_caps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  label text not null,
  cap_p1 int not null,
  cap_p2 int not null,
  sort int not null
);

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  name text not null,
  sort int not null
);

do $$ begin
  if not exists (select 1 from pg_type where typname = 'encounter_status') then
    create type encounter_status as enum ('alive','dead','lost');
  end if;
end $$;

create table if not exists encounters (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  pokemon_name text,
  sprite_url text,
  type1 text,
  type2 text,
  status encounter_status not null default 'alive',
  team_slot int check (team_slot between 1 and 6),
  notes text,
  updated_at timestamptz not null default now(),
  unique(route_id, player_id)
);

create index if not exists idx_routes_run on routes(run_id, sort);
create index if not exists idx_caps_run on level_caps(run_id, sort);
create index if not exists idx_enc_run on encounters(run_id);

alter table runs enable row level security;
alter table players enable row level security;
alter table level_caps enable row level security;
alter table routes enable row level security;
alter table encounters enable row level security;

drop policy if exists "public read runs" on runs;
drop policy if exists "public read players" on players;
drop policy if exists "public read caps" on level_caps;
drop policy if exists "public read routes" on routes;
drop policy if exists "public read encounters" on encounters;

create policy "public read runs" on runs for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read caps" on level_caps for select using (true);
create policy "public read routes" on routes for select using (true);
create policy "public read encounters" on encounters for select using (true);
