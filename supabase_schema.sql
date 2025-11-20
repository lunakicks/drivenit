-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  native_language text default 'en',
  xp integer default 0,
  hearts integer default 5,
  streak integer default 0,
  last_study_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title_it text not null,
  title_en text, -- Fallback/Pre-translated title
  icon_name text, -- For Lucide icon mapping
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Categories are viewable by everyone." on categories for select using ( true );

-- 3. QUESTIONS
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) not null,
  image_url text,
  question_text_it text not null,
  explanation_it text,
  options_it jsonb not null, -- Array of strings
  correct_option_index integer not null,
  difficulty_level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.questions enable row level security;
create policy "Questions are viewable by everyone." on questions for select using ( true );

-- 4. TRANSLATIONS
create table public.translations (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) not null,
  language_code text not null, -- e.g., 'en', 'es', 'fr'
  question_text text,
  explanation text,
  options jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(question_id, language_code)
);

alter table public.translations enable row level security;
create policy "Translations are viewable by everyone." on translations for select using ( true );

-- 5. USER_PROGRESS
create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  question_id uuid references public.questions(id) not null,
  status text check (status in ('correct', 'incorrect', 'flagged')) default 'correct',
  next_review_at timestamp with time zone, -- For Spaced Repetition
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

alter table public.user_progress enable row level security;
create policy "Users can view own progress." on user_progress for select using ( auth.uid() = user_id );
create policy "Users can insert own progress." on user_progress for insert with check ( auth.uid() = user_id );
create policy "Users can update own progress." on user_progress for update using ( auth.uid() = user_id );

-- 6. BOOKMARKS
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  question_id uuid references public.questions(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

alter table public.bookmarks enable row level security;
create policy "Users can view own bookmarks." on bookmarks for select using ( auth.uid() = user_id );
create policy "Users can insert own bookmarks." on bookmarks for insert with check ( auth.uid() = user_id );
create policy "Users can delete own bookmarks." on bookmarks for delete using ( auth.uid() = user_id );

-- 7. FLAGS (Merged into user_progress or separate? Let's keep separate for explicit "Flag for review" feature if distinct from "Incorrect")
-- Actually, let's use a separate table for explicit user flags (like "I want to review this later" vs "I got this wrong")
create table public.flags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  question_id uuid references public.questions(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

alter table public.flags enable row level security;
create policy "Users can view own flags." on flags for select using ( auth.uid() = user_id );
create policy "Users can insert own flags." on flags for insert with check ( auth.uid() = user_id );
create policy "Users can delete own flags." on flags for delete using ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
