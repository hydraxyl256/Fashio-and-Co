-- 0001_init.sql
-- Extensions, enum types, shared helper functions, and the `updated_at` trigger.
-- Applied first; every other migration depends on these primitives.

------------------------------------------------------------------------
-- Extensions
------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

------------------------------------------------------------------------
-- Enum types
------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending_payment',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'pending',
    'authorized',
    'paid',
    'failed',
    'cancelled',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_kind as enum ('percentage', 'fixed_amount');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_applies_to as enum ('order', 'shipping', 'product');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_movement_reason as enum (
    'restock',
    'sale',
    'return',
    'adjustment',
    'reservation',
    'release'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type homepage_section_kind as enum (
    'hero',
    'category_grid',
    'collection_feature',
    'editorial',
    'product_grid'
  );
exception when duplicate_object then null; end $$;

------------------------------------------------------------------------
-- `updated_at` trigger
------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

------------------------------------------------------------------------
-- user_roles
------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

------------------------------------------------------------------------
-- Role helpers (security definer so RLS doesn't recurse on user_roles)
------------------------------------------------------------------------
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.user_roles where user_id = auth.uid() limit 1),
    false
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('staff', 'admin') from public.user_roles where user_id = auth.uid() limit 1),
    false
  );
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_staff_or_admin() from public;
grant execute on function public.current_user_role() to authenticated, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff_or_admin() to authenticated;
