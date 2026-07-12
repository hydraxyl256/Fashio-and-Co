-- 0004_shopping.sql
-- Carts and wishlists. One open cart per user; wishlist is a single bucket
-- per user that can be filtered on the client.

------------------------------------------------------------------------
-- carts
------------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  -- Snapshot of the delivery zone selected by the customer (nullable until checkout)
  delivery_zone_id uuid,
  -- Free-form note the customer can leave for themselves or staff
  note text,
  -- Cached totals, refreshed by server-side actions, not trusted on read.
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'KES',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists carts_user_idx on public.carts (user_id);

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

alter table public.carts enable row level security;

drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
  on public.carts for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own"
  on public.carts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own"
  on public.carts for update
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin())
  with check (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own"
  on public.carts for delete
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

------------------------------------------------------------------------
-- cart_items
------------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0 and quantity <= 50),
  -- Snapshot of pricing to survive variant price changes between add and checkout.
  unit_price_cents integer not null check (unit_price_cents >= 0),
  currency text not null default 'KES',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);
create index if not exists cart_items_variant_idx on public.cart_items (variant_id);

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;

-- Reachable only through the parent cart's RLS.
drop policy if exists "cart_items_select_via_cart" on public.cart_items;
create policy "cart_items_select_via_cart"
  on public.cart_items for select
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (c.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

drop policy if exists "cart_items_insert_via_cart" on public.cart_items;
create policy "cart_items_insert_via_cart"
  on public.cart_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "cart_items_update_via_cart" on public.cart_items;
create policy "cart_items_update_via_cart"
  on public.cart_items for update
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (c.user_id = auth.uid() or public.is_staff_or_admin())
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (c.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

drop policy if exists "cart_items_delete_via_cart" on public.cart_items;
create policy "cart_items_delete_via_cart"
  on public.cart_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (c.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

------------------------------------------------------------------------
-- wishlists
------------------------------------------------------------------------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger wishlists_set_updated_at
  before update on public.wishlists
  for each row execute function public.set_updated_at();

alter table public.wishlists enable row level security;

drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own"
  on public.wishlists for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "wishlists_insert_own" on public.wishlists;
create policy "wishlists_insert_own"
  on public.wishlists for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "wishlists_update_own" on public.wishlists;
create policy "wishlists_update_own"
  on public.wishlists for update
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin())
  with check (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "wishlists_delete_own" on public.wishlists;
create policy "wishlists_delete_own"
  on public.wishlists for delete
  to authenticated
  using (user_id = auth.uid() or public.is_staff_or_admin());

------------------------------------------------------------------------
-- wishlist_items
------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create index if not exists wishlist_items_wishlist_idx on public.wishlist_items (wishlist_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist_items_select_via_wishlist" on public.wishlist_items;
create policy "wishlist_items_select_via_wishlist"
  on public.wishlist_items for select
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id
        and (w.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

drop policy if exists "wishlist_items_insert_via_wishlist" on public.wishlist_items;
create policy "wishlist_items_insert_via_wishlist"
  on public.wishlist_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "wishlist_items_delete_via_wishlist" on public.wishlist_items;
create policy "wishlist_items_delete_via_wishlist"
  on public.wishlist_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id
        and (w.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );
