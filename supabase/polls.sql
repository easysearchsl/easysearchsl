-- Polls & Surveys schema, functions, triggers, RLS, and realtime
-- Run this file in the Supabase SQL Editor. Idempotent where possible.

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1) Tables
-- ============================================================

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  user_id uuid not null references auth.users(id) on delete cascade, -- creator
  listing_id uuid references public.listings(id) on delete cascade,  -- optional: attach to listing
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_polls_created_at on public.polls(created_at desc);
create index if not exists idx_polls_user on public.polls(user_id);
create index if not exists idx_polls_listing on public.polls(listing_id);
create index if not exists idx_polls_active on public.polls(is_active);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_poll_options_poll on public.poll_options(poll_id);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create index if not exists idx_poll_votes_poll on public.poll_votes(poll_id);
create index if not exists idx_poll_votes_option on public.poll_votes(option_id);
create index if not exists idx_poll_votes_user on public.poll_votes(user_id);

-- Ensure the option belongs to the same poll as poll_id (guard against mismatched inserts)
create or replace function public.enforce_vote_option_match()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.poll_options o where o.id = new.option_id and o.poll_id = new.poll_id
  ) then
    raise exception 'option_id % does not belong to poll_id %', new.option_id, new.poll_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_poll_votes_check on public.poll_votes;
create trigger trg_poll_votes_check
before insert or update on public.poll_votes
for each row execute function public.enforce_vote_option_match();

-- ============================================================
-- 2) Functions
-- ============================================================

-- Increment vote function (prevents duplicate votes by the current user)
create or replace function public.increment_poll_vote(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Prevent duplicate votes for this user/poll
  if exists (
    select 1 from public.poll_votes v
    where v.poll_id = p_poll_id and v.user_id = auth.uid()
  ) then
    -- No-op if already voted
    return;
  end if;

  -- Insert vote for current authenticated user
  insert into public.poll_votes (poll_id, option_id, user_id)
  values (p_poll_id, p_option_id, auth.uid());
end;
$$;

grant execute on function public.increment_poll_vote(uuid, uuid) to authenticated;

-- Update updated_at timestamp on polls
create or replace function public.update_poll_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_polls_updated on public.polls;
create trigger trg_polls_updated
before update on public.polls
for each row execute function public.update_poll_timestamp();

-- ============================================================
-- 3) Row Level Security (RLS)
-- ============================================================

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Polls: allow public to read active polls; owners can read/manage their own
-- Select
drop policy if exists "polls select public active" on public.polls;
create policy "polls select public active" on public.polls
for select to anon, authenticated
using (is_active = true);

drop policy if exists "polls select own" on public.polls;
create policy "polls select own" on public.polls
for select to authenticated
using (user_id = auth.uid());

-- Insert
drop policy if exists "polls insert own" on public.polls;
create policy "polls insert own" on public.polls
for insert to authenticated
with check (user_id = auth.uid());

-- Update
drop policy if exists "polls update own" on public.polls;
create policy "polls update own" on public.polls
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Delete
drop policy if exists "polls delete own" on public.polls;
create policy "polls delete own" on public.polls
for delete to authenticated
using (user_id = auth.uid());

-- Poll Options: public can read options for active polls; owners manage their poll's options
-- Select
drop policy if exists "poll_options select for active polls or owner" on public.poll_options;
create policy "poll_options select for active polls or owner" on public.poll_options
for select to anon, authenticated
using (
  exists (
    select 1 from public.polls p
    where p.id = poll_options.poll_id and (p.is_active = true or p.user_id = auth.uid())
  )
);

-- Insert
drop policy if exists "poll_options insert by owner" on public.poll_options;
create policy "poll_options insert by owner" on public.poll_options
for insert to authenticated
with check (
  exists (
    select 1 from public.polls p
    where p.id = poll_options.poll_id and p.user_id = auth.uid()
  )
);

-- Update
drop policy if exists "poll_options update by owner" on public.poll_options;
create policy "poll_options update by owner" on public.poll_options
for update to authenticated
using (
  exists (
    select 1 from public.polls p
    where p.id = poll_options.poll_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.polls p
    where p.id = poll_options.poll_id and p.user_id = auth.uid()
  )
);

-- Delete
drop policy if exists "poll_options delete by owner" on public.poll_options;
create policy "poll_options delete by owner" on public.poll_options
for delete to authenticated
using (
  exists (
    select 1 from public.polls p
    where p.id = poll_options.poll_id and p.user_id = auth.uid()
  )
);

-- Poll Votes: public can read votes for active polls; users can insert/delete their own votes
-- Select
drop policy if exists "poll_votes select for active polls" on public.poll_votes;
create policy "poll_votes select for active polls" on public.poll_votes
for select to anon, authenticated
using (
  exists (
    select 1 from public.polls p
    where p.id = poll_votes.poll_id and p.is_active = true
  )
);

-- Insert (authenticated users vote once per poll enforced by unique constraint)
drop policy if exists "poll_votes insert by self" on public.poll_votes;
create policy "poll_votes insert by self" on public.poll_votes
for insert to authenticated
with check (user_id = auth.uid());

-- Delete own vote (optional)
drop policy if exists "poll_votes delete own" on public.poll_votes;
create policy "poll_votes delete own" on public.poll_votes
for delete to authenticated
using (user_id = auth.uid());

-- ============================================================
-- 4) Realtime publication
-- ============================================================

alter publication supabase_realtime add table if not exists public.polls;
alter publication supabase_realtime add table if not exists public.poll_options;
alter publication supabase_realtime add table if not exists public.poll_votes;
