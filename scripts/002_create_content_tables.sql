-- Create topics table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on topics
alter table public.topics enable row level security;

-- Topics policies (everyone can read)
create policy "topics_select_all" on public.topics for select using (true);


-- Update courses table to include relations and ordering
alter table public.courses 
  add column if not exists topic_id uuid references public.topics(id) on delete set null,
  add column if not exists slug text unique,
  add column if not exists order_index integer default 0;

-- Create modules table
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, slug)
);

-- Enable RLS on modules
alter table public.modules enable row level security;

-- Modules policies (everyone can read)
create policy "modules_select_all" on public.modules for select using (true);


-- Create lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  content_type text check (content_type in ('video', 'text', 'quiz')) default 'video',
  content_url text,
  content_text text,
  duration_minutes integer,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(module_id, slug)
);

-- Enable RLS on lessons
alter table public.lessons enable row level security;

-- Lessons policies (everyone can read)
create policy "lessons_select_all" on public.lessons for select using (true);


-- Create lesson_progress table
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean default false,
  last_position_seconds integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Enable RLS on lesson_progress
alter table public.lesson_progress enable row level security;

-- Lesson progress policies
create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "lesson_progress_update_own" on public.lesson_progress for update using (auth.uid() = user_id);
