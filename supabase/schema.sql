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
  caffeine_mg numeric default 0, -- milligrams (coffee, tea, pre-workout, etc.)
  serving_size text, -- e.g. "100g" or "1 slice"
  is_recipe boolean default false,
  external_source text, -- 'manual', 'usda', 'open_food_facts', 'ai_parsed'
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
  external_source text default 'manual', -- 'manual', 'ai_parsed', 'voice', 'barcode', 'prediction'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RECIPE INGREDIENTS (Foods that compose a recipe)
create table recipe_ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references foods(id) on delete cascade not null, -- the recipe (foods.is_recipe = true)
  ingredient_id uuid references foods(id) not null, -- the component food
  quantity numeric default 1.0,
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
  time_of_day text default 'morning', -- 'morning', 'evening', 'pre_workout', 'anytime'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPLEMENT LOGS
create table supplement_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  supplement_id uuid references supplements(id) on delete cascade not null,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WATER LOGS
create table water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  amount_oz numeric not null,
  external_source text default 'manual', -- 'manual', 'shortcut', 'health_auto_export'
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CAFFEINE LOGS
create table caffeine_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  source text not null, -- 'espresso', 'coffee_12oz', 'pre_workout', etc.
  amount_mg numeric not null,
  external_source text default 'manual',
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
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

alter table recipe_ingredients enable row level security;
create policy "Users can view recipe ingredients" on recipe_ingredients for select using (true);
create policy "Users can manage own recipe ingredients" on recipe_ingredients for all using (
  exists (select 1 from foods where foods.id = recipe_ingredients.recipe_id and foods.created_by = auth.uid())
);

alter table water_logs enable row level security;
create policy "Users can view own water logs" on water_logs for select using (auth.uid() = user_id);
create policy "Users can manage own water logs" on water_logs for all using (auth.uid() = user_id);

alter table caffeine_logs enable row level security;
create policy "Users can view own caffeine logs" on caffeine_logs for select using (auth.uid() = user_id);
create policy "Users can manage own caffeine logs" on caffeine_logs for all using (auth.uid() = user_id);

alter table daily_activity enable row level security;
create policy "Users can view own activity" on daily_activity for select using (auth.uid() = user_id);
create policy "Users can insert/update own activity" on daily_activity for all using (auth.uid() = user_id);
