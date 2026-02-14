-- Profiles table for role-based access control
-- Run this SQL in your Supabase SQL editor after creating your project.
-- Then manually set role = 'admin' for your admin user:
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';

-- Enum for user roles (shows as dropdown in Supabase table editor)
create type public.user_role as enum ('customer', 'admin', 'affiliate');

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS: users can read and update their own profile
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- List all tables in the public schema (used by admin storage settings page)
create or replace function public.list_public_tables()
returns table (
  table_name text,
  table_oid bigint,
  row_estimate bigint,
  has_rls boolean
) as $$
  select
    c.relname::text as table_name,
    c.oid::bigint as table_oid,
    greatest(c.reltuples, 0)::bigint as row_estimate,
    c.relrowsecurity as has_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
  order by c.relname;
$$ language sql security definer stable;

grant execute on function public.list_public_tables() to anon, authenticated;

-- List all storage buckets (used by admin storage settings page)
create or replace function public.list_storage_buckets()
returns table (
  id text,
  name text,
  is_public boolean,
  created_at timestamptz
) as $$
  select
    b.id::text,
    b.name::text,
    b.public as is_public,
    b.created_at
  from storage.buckets b
  order by b.name;
$$ language sql security definer stable;

grant execute on function public.list_storage_buckets() to anon, authenticated;
