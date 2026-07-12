-- 0002_user_access.sql
-- User, role, and address tables with RLS.
-- Each auth.users row gets a `profiles` record via trigger; a `user_roles`
-- row is created with role='customer' by default and can be promoted to
-- staff/admin manually.

------------------------------------------------------------------------
-- profiles
------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text,
  phone text,
  avatar_url text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_update_staff" on public.profiles;
create policy "profiles_update_staff"
  on public.profiles for update
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- Direct deletes from the browser are forbidden; use a service-role call.



create index if not exists user_roles_role_idx on public.user_roles (role);

create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

alter table public.user_roles enable row level security;

-- Users can read their own role; staff can read all.
drop policy if exists "user_roles_select_self_or_staff" on public.user_roles;
create policy "user_roles_select_self_or_staff"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

-- Inserts and updates require admin. Direct writes from the browser are
-- otherwise impossible (no policy = denied).
drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write"
  on public.user_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

------------------------------------------------------------------------
-- addresses
------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,                         -- e.g. "Home", "Office"
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text,                        -- county / state
  postal_code text,
  country text not null default 'KE',
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "addresses_select_own_or_staff" on public.addresses;
create policy "addresses_select_own_or_staff"
  on public.addresses for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own"
  on public.addresses for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own"
  on public.addresses for update
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin())
  with check (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own"
  on public.addresses for delete
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

------------------------------------------------------------------------
-- Profile auto-creation trigger
------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if present so this migration is idempotent.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
