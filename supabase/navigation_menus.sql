-- Optional DB-driven menus for role-based navigation
-- Safe to run multiple times

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('public','business','guest')),
  label text not null,
  path text not null,
  position int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_navigation_menus_role on public.navigation_menus(role);
create index if not exists idx_navigation_menus_position on public.navigation_menus(role, position);
create unique index if not exists uq_navigation_menus_role_path on public.navigation_menus(role, path);

alter table public.navigation_menus enable row level security;

-- Allow reads to everyone
drop policy if exists navigation_menus_select_all on public.navigation_menus;
create policy navigation_menus_select_all on public.navigation_menus
for select to anon, authenticated
using (true);

-- No insert/update/delete policies by default (managed by service role / Studio)

-- Seed defaults only if empty per role
insert into public.navigation_menus(role, label, path, position) values
  ('public','Home','/',0),
  ('public','Listings','/listings',1),
  ('public','About Us','/about',2),
  ('public','Contact Us','/contact',3),
  ('public','Pricing','/pricing',4)
on conflict do nothing;

insert into public.navigation_menus(role, label, path, position) values
  ('business','Dashboard','/dashboard',0),
  ('business','Listings','/manage-listings',1),
  ('business','Saved Listings','/saved',2),
  ('business','Submit Review','/reviews/submit',3),
  ('business','Announcements','/announcements',4),
  ('business','News & Blog','/news-blog',5),
  ('business','Products & Services','/products',6),
  ('business','Manage Polls','/polls',7),
  ('business','Messages','/inbox',8),
  ('business','Team','/team',9),
  ('business','Analytics','/analytics',10),
  ('business','Subscription','/subscription',11)
on conflict do nothing;

insert into public.navigation_menus(role, label, path, position) values
  ('guest','Dashboard','/dashboard',0),
  ('guest','Saved Listings','/saved',1),
  ('guest','Messages','/inbox',2),
  ('guest','Subscription','/subscription',3)
on conflict do nothing;
