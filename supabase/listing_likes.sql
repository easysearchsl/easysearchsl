-- Likes table for listings
-- Run this file in Supabase SQL Editor.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.listing_likes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists idx_listing_likes_listing on public.listing_likes(listing_id);
create index if not exists idx_listing_likes_user on public.listing_likes(user_id);

alter table public.listing_likes enable row level security;

-- Allow anyone to read like rows so counts work for public UIs
drop policy if exists "listing_likes select all" on public.listing_likes;
create policy "listing_likes select all" on public.listing_likes
for select to anon, authenticated
using (true);

-- Only the user can like/unlike on their behalf
drop policy if exists "listing_likes insert own" on public.listing_likes;
create policy "listing_likes insert own" on public.listing_likes
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "listing_likes delete own" on public.listing_likes;
create policy "listing_likes delete own" on public.listing_likes
for delete to authenticated
using (auth.uid() = user_id);

-- Ensure realtime publication includes this table
alter publication supabase_realtime add table if not exists public.listing_likes;
