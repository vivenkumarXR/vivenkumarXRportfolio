-- Let's Learn Morse Code: Blackout
-- Online progress and leaderboard.
--
-- How to use: in Supabase, open SQL Editor, click "New query", paste this
-- whole file and click "Run". You can run it again safely.
--
-- How it works:
--  * Each player has a secret 12-letter save code. Only a hash of it is stored.
--  * Nobody can read or change the table directly with the public key.
--    The website can only call the four llmc_ functions below.
--  * Leaderboard names must be generated codenames ("Swift Falcon 42"),
--    so children can't put their real name or rude words on it.

create table if not exists public.llmc_players (
  code_hash   text primary key,
  name        text not null,
  points      integer not null default 0,
  stars       integer not null default 0,
  days        integer not null default 0,
  streak      integer not null default 0,
  progress    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint llmc_name_ok check (name ~ '^(Midnight|Silent|Swift|Lucky|Brave|Clever|Hidden|Electric|Shadow|Secret|Golden|Cosmic|Rapid|Mighty|Sneaky|Starry) (Owl|Comet|Falcon|Fox|Spark|Echo|Panther|Rocket|Badger|Lantern|Tiger|Otter|Raven|Gecko|Wolf|Dolphin)( [0-9]{1,3})?$'),
  constraint llmc_points_ok check (points between 0 and 30000),
  constraint llmc_stars_ok check (stars between 0 and 63),
  constraint llmc_days_ok check (days between 0 and 21),
  constraint llmc_streak_ok check (streak between 0 and 3650),
  constraint llmc_progress_size check (octet_length(progress::text) <= 16000)
);

create index if not exists llmc_players_points_idx on public.llmc_players (points desc, updated_at);

alter table public.llmc_players enable row level security;
revoke all on table public.llmc_players from anon, authenticated;

create or replace function public.llmc_hash(p_code text)
returns text
language sql immutable
set search_path = public
as $$
  select encode(sha256(convert_to(upper(p_code), 'UTF8')), 'hex');
$$;

create or replace function public.llmc_save(
  p_code text, p_name text, p_points integer, p_stars integer,
  p_days integer, p_streak integer, p_progress jsonb
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if p_code is null or upper(p_code) !~ '^[A-Z2-9]{12}$' then
    raise exception 'invalid save code';
  end if;
  insert into public.llmc_players as p (code_hash, name, points, stars, days, streak, progress, updated_at)
  values (public.llmc_hash(p_code), p_name, p_points, p_stars, p_days, p_streak,
          coalesce(p_progress, '{}'::jsonb), now())
  on conflict (code_hash) do update
    set name = excluded.name,
        points = excluded.points,
        stars = excluded.stars,
        days = excluded.days,
        streak = excluded.streak,
        progress = excluded.progress,
        updated_at = now();
end;
$$;

create or replace function public.llmc_load(p_code text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object('name', name, 'points', points, 'stars', stars,
                            'days', days, 'streak', streak, 'progress', progress)
  from public.llmc_players
  where code_hash = public.llmc_hash(p_code);
$$;

create or replace function public.llmc_leaderboard(p_limit integer default 20)
returns table (name text, points integer, stars integer, days integer)
language sql stable security definer
set search_path = public
as $$
  select name, points, stars, days
  from public.llmc_players
  where days > 0
  order by points desc, updated_at asc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

create or replace function public.llmc_rank(p_code text)
returns integer
language sql stable security definer
set search_path = public
as $$
  select (select count(*)::integer + 1 from public.llmc_players o
          where o.days > 0 and o.points > me.points)
  from public.llmc_players me
  where me.code_hash = public.llmc_hash(p_code);
$$;

revoke all on function public.llmc_hash(text) from public, anon, authenticated;
revoke all on function public.llmc_save(text, text, integer, integer, integer, integer, jsonb) from public;
revoke all on function public.llmc_load(text) from public;
revoke all on function public.llmc_leaderboard(integer) from public;
revoke all on function public.llmc_rank(text) from public;

grant execute on function public.llmc_save(text, text, integer, integer, integer, integer, jsonb) to anon, authenticated;
grant execute on function public.llmc_load(text) to anon, authenticated;
grant execute on function public.llmc_leaderboard(integer) to anon, authenticated;
grant execute on function public.llmc_rank(text) to anon, authenticated;
