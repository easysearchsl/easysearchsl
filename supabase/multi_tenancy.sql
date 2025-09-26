-- Multi-tenancy schema for organizations and memberships
-- Safe to run multiple times (idempotent creates)

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_organizations_created_at on public.organizations(created_at desc);

-- Organization members
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists idx_organization_members_user on public.organization_members(user_id);
create index if not exists idx_organization_members_org on public.organization_members(organization_id);

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- RLS: organization_members - a user can see their own membership rows
drop policy if exists "select own memberships" on public.organization_members;
create policy "select own memberships" on public.organization_members
for select to authenticated
using (user_id = auth.uid());

-- RLS: organization_members - allow a user to insert their own membership row (optional)
drop policy if exists "insert membership as self" on public.organization_members;
create policy "insert membership as self" on public.organization_members
for insert to authenticated
with check (user_id = auth.uid());

-- RLS: organizations - a user can select orgs where they are a member
drop policy if exists "select orgs as member" on public.organizations;
create policy "select orgs as member" on public.organizations
for select to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organizations.id and m.user_id = auth.uid()
  )
);

-- RLS: organizations - allow insert for any authenticated user (becomes owner via app logic)
drop policy if exists "insert org as authenticated" on public.organizations;
create policy "insert org as authenticated" on public.organizations
for insert to authenticated
with check (created_by = auth.uid());
