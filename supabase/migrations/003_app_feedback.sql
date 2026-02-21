-- Migration: App feedback table for in-app tester observations
-- Stores bug reports, design notes, feature ideas, and observations

create table if not exists app_feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category text not null default 'observation' check (category in ('bug', 'design', 'feature', 'observation')),
  body text not null,
  page text,
  resolved boolean default false
);

alter table app_feedback enable row level security;

create policy "Users can view own feedback" on app_feedback
  for select using (auth.uid() = user_id);

create policy "Users can insert own feedback" on app_feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can update own feedback" on app_feedback
  for update using (auth.uid() = user_id);

create policy "Users can delete own feedback" on app_feedback
  for delete using (auth.uid() = user_id);

create index if not exists idx_app_feedback_user_created
  on app_feedback (user_id, created_at desc);
