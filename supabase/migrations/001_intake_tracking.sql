-- Migration: Add water, caffeine, recipe, and external_source tracking
-- Run this against your Supabase project via the SQL editor

-- 1. Extend foods table
alter table foods add column if not exists caffeine_mg numeric default 0;
alter table foods add column if not exists is_recipe boolean default false;
alter table foods add column if not exists external_source text;

-- 2. Add external_source to meal_entries
alter table meal_entries add column if not exists external_source text default 'manual';

-- 3. Add time_of_day to supplements
alter table supplements add column if not exists time_of_day text default 'morning';

-- 4. Recipe ingredients table
create table if not exists recipe_ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references foods(id) on delete cascade not null,
  ingredient_id uuid references foods(id) not null,
  quantity numeric default 1.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table recipe_ingredients enable row level security;
create policy "Users can view recipe ingredients" on recipe_ingredients for select using (true);
create policy "Users can manage own recipe ingredients" on recipe_ingredients for all using (
  exists (select 1 from foods where foods.id = recipe_ingredients.recipe_id and foods.created_by = auth.uid())
);

-- 5. Water logs table
create table if not exists water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  amount_oz numeric not null,
  external_source text default 'manual',
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table water_logs enable row level security;
create policy "Users can view own water logs" on water_logs for select using (auth.uid() = user_id);
create policy "Users can manage own water logs" on water_logs for all using (auth.uid() = user_id);

-- 6. Caffeine logs table
create table if not exists caffeine_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  source text not null,
  amount_mg numeric not null,
  external_source text default 'manual',
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table caffeine_logs enable row level security;
create policy "Users can view own caffeine logs" on caffeine_logs for select using (auth.uid() = user_id);
create policy "Users can manage own caffeine logs" on caffeine_logs for all using (auth.uid() = user_id);
