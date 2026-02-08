-- Create lesson_resources table
create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  type text not null check (type in ('file', 'link')),
  url text not null,
  file_size integer, -- Size in bytes if type is file
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.lesson_resources enable row level security;

-- Policies
create policy "Public read access"
  on public.lesson_resources for select
  using (true);

create policy "Admin insert access"
  on public.lesson_resources for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update access"
  on public.lesson_resources for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete access"
  on public.lesson_resources for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create storage bucket for resources
insert into storage.buckets (id, name, public)
values ('course-resources', 'course-resources', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'course-resources' );

create policy "Admin Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'course-resources' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
