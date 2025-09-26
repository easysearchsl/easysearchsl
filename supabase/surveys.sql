-- Surveys feature schema (surveys, survey_questions, survey_responses)
-- Run this in your Supabase SQL editor or psql connected to your project

-- Extensions
create extension if not exists pgcrypto;

-- Core tables
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null,
  listing_id uuid null,
  created_by uuid not null,
  title text not null,
  description text null,
  type text not null check (type in ('poll','survey')) default 'survey',
  is_anonymous boolean not null default false,
  visibility text not null check (visibility in ('public','private')) default 'public',
  status text not null check (status in ('active','inactive')) default 'active',
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null check (
    question_type in (
      'short_answer','long_answer','multiple_choice','dropdown','checkboxes','rating','linear_scale','multiple_choice_grid','checkbox_grid'
    )
  ),
  -- JSON options: array for choices/dropdown/checkboxes; object {rows, columns} for grids
  options jsonb null,
  -- scales when applicable
  min_scale int null,
  max_scale int null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid null,
  -- answers keyed by question_id, value depends on question_type
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists surveys_listing_idx on public.surveys(listing_id);
create index if not exists surveys_org_idx on public.surveys(organization_id);
create index if not exists survey_questions_survey_idx on public.survey_questions(survey_id, sort_order);
create index if not exists survey_responses_survey_idx on public.survey_responses(survey_id);
create index if not exists survey_responses_answers_gin on public.survey_responses using gin(answers);

-- Trigger to keep updated_at fresh
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_surveys_updated_at
  before update on public.surveys
  for each row
  execute procedure public.set_current_timestamp_updated_at();

-- RLS
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;

-- Policies for surveys: creator can insert/update/delete; everyone can select (adjust as needed)
create policy if not exists surveys_select_public on public.surveys
  for select using (true);

create policy if not exists surveys_insert_creator on public.surveys
  for insert with check (auth.uid() = created_by);

create policy if not exists surveys_update_creator on public.surveys
  for update using (auth.uid() = created_by);

create policy if not exists surveys_delete_creator on public.surveys
  for delete using (auth.uid() = created_by);

-- Policies for survey_questions: readable by all; only survey owner can write
create policy if not exists survey_questions_select_public on public.survey_questions
  for select using (true);

create policy if not exists survey_questions_insert_owner on public.survey_questions
  for insert with check (
    exists (
      select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()
    )
  );

create policy if not exists survey_questions_update_owner on public.survey_questions
  for update using (
    exists (
      select 1 from public.surveys s where s.id = survey_questions.survey_id and s.created_by = auth.uid()
    )
  );

create policy if not exists survey_questions_delete_owner on public.survey_questions
  for delete using (
    exists (
      select 1 from public.surveys s where s.id = survey_questions.survey_id and s.created_by = auth.uid()
    )
  );

-- Policies for survey_responses: creator can view all responses; a responder can view their own row; anyone can insert (for anonymous/guest responses)
create policy if not exists survey_responses_select_owner_or_self on public.survey_responses
  for select using (
    (auth.uid() is not null and auth.uid() = user_id)
    or exists (
      select 1 from public.surveys s where s.id = survey_responses.survey_id and s.created_by = auth.uid()
    )
  );

create policy if not exists survey_responses_insert_any on public.survey_responses
  for insert with check (true);

-- Optional: restrict update/delete of responses (typically not needed)
create policy if not exists survey_responses_update_owner on public.survey_responses
  for update using (exists (
    select 1 from public.surveys s where s.id = survey_responses.survey_id and s.created_by = auth.uid()
  ));

create policy if not exists survey_responses_delete_owner on public.survey_responses
  for delete using (exists (
    select 1 from public.surveys s where s.id = survey_responses.survey_id and s.created_by = auth.uid()
  ));
