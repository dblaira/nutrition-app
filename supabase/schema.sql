-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  calorie_goal integer default 2400,
  protein_goal integer default 150,
  carbs_goal integer default 250,
  fat_goal integer default 80,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FOODS (Global + User Custom)
create table foods (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references auth.users(id), -- null means global/system food
  name text not null,
  brand text,
  calories integer not null,
  protein numeric not null, -- grams
  carbs numeric not null, -- grams
  fat numeric not null, -- grams
  serving_size text, -- e.g. "100g" or "1 slice"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEALS (The slots: Breakfast, Lunch, etc. for a specific day)
create table meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null default current_date,
  name text not null, -- "Breakfast", "Lunch", "Dinner", "Snack"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date, name)
);

-- MEAL ENTRIES (The actual food items in a meal)
create table meal_entries (
  id uuid default uuid_generate_v4() primary key,
  meal_id uuid references meals(id) on delete cascade not null,
  food_id uuid references foods(id) not null,
  quantity numeric default 1.0, -- Multiplier of serving size
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPLEMENTS (Inventory)
create table supplements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  brand text,
  default_dosage text, -- e.g. "1 scoop"
  current_stock integer, -- estimated servings remaining
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPLEMENT LOGS
create table supplement_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  supplement_id uuid references supplements(id) on delete cascade not null,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DAILY ACTIVITY (From Apple Health via Shortcut)
create table daily_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null default current_date,
  active_calories integer default 0,
  steps integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- RLS POLICIES
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table foods enable row level security;
create policy "Users can view all foods" on foods for select using (true);
create policy "Users can create custom foods" on foods for insert with check (auth.uid() = created_by);

alter table meals enable row level security;
create policy "Users can view own meals" on meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on meals for insert with check (auth.uid() = user_id);

alter table meal_entries enable row level security;
create policy "Users can view own entries" on meal_entries for select using (
  exists (select 1 from meals where meals.id = meal_entries.meal_id and meals.user_id = auth.uid())
);
create policy "Users can insert own entries" on meal_entries for insert with check (
  exists (select 1 from meals where meals.id = meal_entries.meal_id and meals.user_id = auth.uid())
);

alter table supplements enable row level security;
create policy "Users can view own supplements" on supplements for select using (auth.uid() = user_id);
create policy "Users can manage own supplements" on supplements for all using (auth.uid() = user_id);

alter table supplement_logs enable row level security;
create policy "Users can view own logs" on supplement_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on supplement_logs for insert with check (auth.uid() = user_id);

alter table daily_activity enable row level security;
create policy "Users can view own activity" on daily_activity for select using (auth.uid() = user_id);
create policy "Users can insert/update own activity" on daily_activity for all using (auth.uid() = user_id);
