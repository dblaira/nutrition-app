-- Migration: App errors table for in-app debug layer
-- Stores errors from client components, API routes, and error boundaries

create table if not exists app_errors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  level text not null default 'error' check (level in ('error', 'warn', 'info')),
  source text not null,
  message text not null,
  context jsonb default '{}'::jsonb,
  resolved boolean default false
);

alter table app_errors enable row level security;

create policy "Users can view own errors" on app_errors
  for select using (auth.uid() = user_id);

create policy "Users can insert own errors" on app_errors
  for insert with check (auth.uid() = user_id);

create policy "Users can update own errors" on app_errors
  for update using (auth.uid() = user_id);

create policy "Service role full access" on app_errors
  for all using (auth.role() = 'service_role');

create index if not exists idx_app_errors_user_created
  on app_errors (user_id, created_at desc);

create index if not exists idx_app_errors_unresolved
  on app_errors (user_id, resolved) where resolved = false;
