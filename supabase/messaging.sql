-- Messaging schema and RLS policies for Supabase
-- Run this file in Supabase SQL Editor.

-- Enable pgcrypto (for gen_random_uuid) if not already enabled
create extension if not exists pgcrypto;

-- Helper: check if current_user participates in a thread
create or replace function public.is_thread_participant(p_thread_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.thread_participants tp
    where tp.thread_id = p_thread_id and tp.user_id = auth.uid()
  );
$$;

-- Threads
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Participants
create table if not exists public.thread_participants (
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  attachments jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- Indexes for performance
create index if not exists idx_messages_thread_created_at on public.messages(thread_id, created_at desc);
create index if not exists idx_threads_created_at on public.message_threads(created_at desc);
create index if not exists idx_thread_participants_user on public.thread_participants(user_id);

-- RLS
alter table public.message_threads enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages enable row level security;

-- Policies: message_threads
create policy if not exists "select threads as participant"
  on public.message_threads for select
  using (public.is_thread_participant(id));

create policy if not exists "insert threads as creator"
  on public.message_threads for insert
  with check (auth.uid() = created_by);

-- Optionally allow creator to delete their own thread
create policy if not exists "delete own threads"
  on public.message_threads for delete
  using (auth.uid() = created_by);

-- Policies: thread_participants
create policy if not exists "select own participant rows"
  on public.thread_participants for select
  using (user_id = auth.uid());

-- Allow thread creator to add participants
create policy if not exists "insert participant by creator"
  on public.thread_participants for insert
  with check (exists (
    select 1 from public.message_threads t
    where t.id = thread_id and t.created_by = auth.uid()
  ));

-- Policies: messages
create policy if not exists "select messages as participant"
  on public.messages for select
  using (public.is_thread_participant(thread_id));

create policy if not exists "insert messages as participant"
  on public.messages for insert
  with check (
    public.is_thread_participant(thread_id) and auth.uid() = sender_id
  );

-- Optional: mark read
create or replace function public.mark_thread_read(p_thread_id uuid)
returns void language sql security definer as $$
  update public.messages
  set read_at = now()
  where thread_id = p_thread_id and read_at is null and sender_id <> auth.uid();
$$;

-- Realtime: ensure tables are part of the supabase_realtime publication
-- You can alternatively enable Realtime per-table via the Supabase Dashboard UI.
do $$ begin
  perform 1;
  exception when undefined_object then null;
end $$;

alter publication supabase_realtime add table if not exists public.messages;
alter publication supabase_realtime add table if not exists public.message_threads;
alter publication supabase_realtime add table if not exists public.thread_participants;
