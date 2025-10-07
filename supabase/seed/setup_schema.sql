-- Setup missing tables used by the app (idempotent)
-- Run in Supabase SQL Editor using your project's database.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- profiles: one row per auth user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('registered','business','superadmin')) default 'registered',
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

-- app_admins: marks users who are superadmins
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- listings table (minimal columns aligned to app's Listing type)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  tags text[] default '{}',
  location jsonb not null default '{}'::jsonb, -- { province, district, chiefdom }
  full_address text,
  business_hours jsonb default '{}'::jsonb,
  price_range text check (price_range in ('affordable','moderate','premium')),
  images text[] default '{}',
  videos text[] default '{}',
  announcements jsonb default '[]'::jsonb,
  deals jsonb default '[]'::jsonb,
  events jsonb default '[]'::jsonb,
  social_links jsonb default '{}'::jsonb,
  reviews jsonb default '[]'::jsonb,
  rating numeric not null default 0,
  review_count integer not null default 0,
  view_count integer default 0,
  likes_count integer default 0,
  booking_enabled boolean not null default false,
  status text not null check (status in ('draft','published','archived')) default 'published',
  featured_until timestamptz,
  legal_status text,
  year_registered integer,
  verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_org on public.listings(organization_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_category on public.listings(category);

-- Simple RLS allowing read for anon/auth (adjust as needed)
alter table public.listings enable row level security;

drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings for select using (true);

-- Allow owners to manage their org listings (example, relax per your needs)
drop policy if exists "org members manage listings" on public.listings;
create policy "org members manage listings" on public.listings
for all to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = listings.organization_id and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = listings.organization_id and m.user_id = auth.uid()
  )
);
