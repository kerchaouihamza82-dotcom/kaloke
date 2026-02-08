-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  duration_hours decimal,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on courses
alter table public.courses enable row level security;

-- Courses policies (everyone can read courses)
create policy "courses_select_all" on public.courses for select using (true);

-- Create enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  unique(user_id, course_id)
);

-- Enable RLS on enrollments
alter table public.enrollments enable row level security;

-- Enrollments policies
create policy "enrollments_select_own" on public.enrollments for select using (auth.uid() = user_id);
create policy "enrollments_insert_own" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enrollments_update_own" on public.enrollments for update using (auth.uid() = user_id);
create policy "enrollments_delete_own" on public.enrollments for delete using (auth.uid() = user_id);

-- Create community_posts table
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on community_posts
alter table public.community_posts enable row level security;

-- Community posts policies (everyone can read, only own can write)
create policy "community_posts_select_all" on public.community_posts for select using (true);
create policy "community_posts_insert_own" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "community_posts_update_own" on public.community_posts for update using (auth.uid() = user_id);
create policy "community_posts_delete_own" on public.community_posts for delete using (auth.uid() = user_id);

-- Create live_calls table
create table if not exists public.live_calls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer not null,
  meeting_url text,
  recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on live_calls
alter table public.live_calls enable row level security;

-- Live calls policies (everyone can read)
create policy "live_calls_select_all" on public.live_calls for select using (true);
