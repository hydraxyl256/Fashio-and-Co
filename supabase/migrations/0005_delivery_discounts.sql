-- 0005_delivery_discounts.sql
-- Delivery zones, delivery rates, and discount codes/redemptions.
-- These tables are public-readable; only staff/admin can write.

------------------------------------------------------------------------
-- delivery_zones
------------------------------------------------------------------------
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'KE',
  region text,                         -- nullable: matches any region in country
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_zones_country_idx on public.delivery_zones (country);
create index if not exists delivery_zones_active_idx on public.delivery_zones (is_active);

create trigger delivery_zones_set_updated_at
  before update on public.delivery_zones
  for each row execute function public.set_updated_at();

alter table public.delivery_zones enable row level security;

drop policy if exists "delivery_zones_public_read" on public.delivery_zones;
create policy "delivery_zones_public_read"
  on public.delivery_zones for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "delivery_zones_staff_write" on public.delivery_zones;
create policy "delivery_zones_staff_write"
  on public.delivery_zones for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- delivery_rates
------------------------------------------------------------------------
create table if not exists public.delivery_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.delivery_zones (id) on delete cascade,
  name text not null,                  -- e.g. "Standard", "Same-day"
  description text,
  price_cents integer not null check (price_cents >= 0),
  free_threshold_cents integer check (free_threshold_cents is null or free_threshold_cents >= 0),
  eta_min_days integer check (eta_min_days is null or eta_min_days >= 0),
  eta_max_days integer check (eta_max_days is null or eta_max_days >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_rates_zone_idx on public.delivery_rates (zone_id);

create trigger delivery_rates_set_updated_at
  before update on public.delivery_rates
  for each row execute function public.set_updated_at();

alter table public.delivery_rates enable row level security;

drop policy if exists "delivery_rates_public_read" on public.delivery_rates;
create policy "delivery_rates_public_read"
  on public.delivery_rates for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "delivery_rates_staff_write" on public.delivery_rates;
create policy "delivery_rates_staff_write"
  on public.delivery_rates for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- discount_codes
------------------------------------------------------------------------
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  kind discount_kind not null,
  applies_to discount_applies_to not null default 'order',
  value integer not null check (value > 0),  -- basis points for %, cents for fixed
  min_subtotal_cents integer check (min_subtotal_cents is null or min_subtotal_cents >= 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemptions_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discount_codes_value_range
    check (
      (kind = 'percentage' and value <= 10000) or
      (kind = 'fixed_amount' and value > 0)
    ),
  constraint discount_codes_window
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index if not exists discount_codes_active_idx on public.discount_codes (is_active);

create trigger discount_codes_set_updated_at
  before update on public.discount_codes
  for each row execute function public.set_updated_at();

alter table public.discount_codes enable row level security;

drop policy if exists "discount_codes_public_read" on public.discount_codes;
create policy "discount_codes_public_read"
  on public.discount_codes for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "discount_codes_staff_write" on public.discount_codes;
create policy "discount_codes_staff_write"
  on public.discount_codes for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- discount_redemptions
------------------------------------------------------------------------
create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discount_codes (id) on delete restrict,
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid,                       -- FK added by orders migration
  redeemed_at timestamptz not null default now()
);

create index if not exists discount_redemptions_user_idx on public.discount_redemptions (user_id);
create index if not exists discount_redemptions_discount_idx on public.discount_redemptions (discount_id);

-- The redemption counter on discount_codes is incremented via a server-side
-- function or trigger in the orders migration. No client may write here.
alter table public.discount_redemptions enable row level security;

drop policy if exists "discount_redemptions_select_own_or_staff" on public.discount_redemptions;
create policy "discount_redemptions_select_own_or_staff"
  on public.discount_redemptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());
