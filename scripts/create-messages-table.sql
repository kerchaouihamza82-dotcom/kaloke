-- Create messages table for community chat
create table if not exists public.messages (
  id bigserial primary key,
  content text not null,
  user_name text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Allow anyone authenticated to read messages
create policy "messages_select_all" on public.messages
  for select
  using (true);

-- Allow anyone authenticated to insert messages
create policy "messages_insert_authenticated" on public.messages
  for insert
  with check (auth.uid() is not null);

-- Create function to keep only last 100 messages
create or replace function public.cleanup_old_messages()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from public.messages
  where id not in (
    select id from public.messages
    order by created_at desc
    limit 100
  );
  return new;
end;
$$;

-- Create trigger to run cleanup after each insert
drop trigger if exists cleanup_messages_trigger on public.messages;

create trigger cleanup_messages_trigger
  after insert on public.messages
  for each statement
  execute function public.cleanup_old_messages();

-- Create index for better performance
create index if not exists idx_messages_created_at on public.messages(created_at desc);
