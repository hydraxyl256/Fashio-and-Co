-- 0006_orders_payments_inventory.sql
-- Orders, order_items, payments, order_status_history, inventory_movements,
-- and stock_reservations. These tables are the most sensitive in the schema.
-- All writes must go through server-side code (service role or security
-- definer functions). The browser is restricted to creating a draft order,
-- reading back the customer's own orders, and nothing else.

------------------------------------------------------------------------
-- orders
------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,                -- e.g. FC-2026-000123
  user_id uuid references public.profiles (id) on delete set null,

  -- Customer snapshot (denormalized at order time; never mutated after).
  customer_email citext not null,
  customer_full_name text,
  customer_phone text,

  -- Shipping address snapshot
  shipping_recipient_name text not null,
  shipping_phone text not null,
  shipping_line1 text not null,
  shipping_line2 text,
  shipping_city text not null,
  shipping_region text,
  shipping_postal_code text,
  shipping_country text not null default 'KE',

  -- Billing address (if different)
  billing_recipient_name text,
  billing_phone text,
  billing_line1 text,
  billing_line2 text,
  billing_city text,
  billing_region text,
  billing_postal_code text,
  billing_country text,

  -- Delivery snapshot
  delivery_zone_id uuid references public.delivery_zones (id) on delete set null,
  delivery_rate_id uuid references public.delivery_rates (id) on delete set null,
  delivery_zone_name text,
  delivery_rate_name text,
  delivery_price_cents integer not null default 0,

  -- Money (all in KES cents unless `currency` differs)
  currency text not null default 'KES',
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  applied_discount_code text,

  -- Status
  status order_status not null default 'pending_payment',
  placed_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  internal_note text,                                -- staff-only
  customer_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_totals_nonneg
    check (
      subtotal_cents >= 0 and discount_cents >= 0
      and shipping_cents >= 0 and tax_cents >= 0
      and total_cents >= 0
    )
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_placed_idx on public.orders (placed_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

-- A customer can create a draft order for themselves only. Status changes
-- and total mutations must happen server-side.
drop policy if exists "orders_insert_own_draft" on public.orders;
create policy "orders_insert_own_draft"
  on public.orders for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending_payment'
    and customer_email = (select email from public.profiles where id = auth.uid())
  );

-- Only staff can update order status. Customers cannot mutate orders once placed.
drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update"
  on public.orders for update
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "orders_staff_delete" on public.orders;
create policy "orders_staff_delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

------------------------------------------------------------------------
-- order_items
------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  -- Snapshots
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  variant_title text,                                -- e.g. "Brass · 16 in"
  sku text,
  size text,
  color text,
  material text,
  metal text,
  gemstone text,
  image_url text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  currency text not null default 'KES',
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_variant_idx on public.order_items (variant_id);

alter table public.order_items enable row level security;

drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_order"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

drop policy if exists "order_items_staff_write" on public.order_items;
create policy "order_items_staff_write"
  on public.order_items for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- payments
------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  provider text not null,                            -- 'pesapal' | 'flutterwave' | etc.
  provider_reference text,                           -- gateway txn id
  provider_status text,
  method text,                                       -- 'mpesa', 'card', ...
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'KES',
  status payment_status not null default 'pending',
  raw_payload jsonb,                                 -- gateway response (server-side only)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments (order_id);
create index if not exists payments_status_idx on public.payments (status);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

-- Customers can view payments attached to their own orders.
drop policy if exists "payments_select_via_order" on public.payments;
create policy "payments_select_via_order"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and (o.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

-- Direct payment writes from the browser are forbidden; only service role
-- can create or update payment records.

------------------------------------------------------------------------
-- order_status_history
------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at desc);

alter table public.order_status_history enable row level security;

drop policy if exists "order_status_history_select_via_order" on public.order_status_history;
create policy "order_status_history_select_via_order"
  on public.order_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

-- Writes only via service role or security definer function.

------------------------------------------------------------------------
-- inventory_movements
------------------------------------------------------------------------
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  delta integer not null,                            -- positive=in, negative=out
  reason inventory_movement_reason not null,
  order_id uuid references public.orders (id) on delete set null,
  performed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_variant_idx
  on public.inventory_movements (variant_id, created_at desc);

alter table public.inventory_movements enable row level security;

-- Staff can read inventory movements; the browser is denied all writes.
drop policy if exists "inventory_movements_select_staff" on public.inventory_movements;
create policy "inventory_movements_select_staff"
  on public.inventory_movements for select
  to authenticated
  using (public.is_staff_or_admin());

------------------------------------------------------------------------
-- stock_reservations
------------------------------------------------------------------------
create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  cart_id uuid references public.carts (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  quantity integer not null check (quantity > 0),
  expires_at timestamptz not null,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists stock_reservations_variant_idx
  on public.stock_reservations (variant_id);
create index if not exists stock_reservations_active_idx
  on public.stock_reservations (variant_id)
  where released_at is null;

alter table public.stock_reservations enable row level security;

-- Only staff can read reservations; the browser cannot create them.
drop policy if exists "stock_reservations_select_staff" on public.stock_reservations;
create policy "stock_reservations_select_staff"
  on public.stock_reservations for select
  to authenticated
  using (public.is_staff_or_admin());

------------------------------------------------------------------------
-- Late FK from discount_redemptions to orders
------------------------------------------------------------------------
do $$ begin
  alter table public.discount_redemptions
    add constraint discount_redemptions_order_fk
    foreign key (order_id) references public.orders (id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists discount_redemptions_order_idx
  on public.discount_redemptions (order_id);
