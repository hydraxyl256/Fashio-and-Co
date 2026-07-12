-- 0003_catalogue.sql
-- Categories, collections, products, images, variants, and the join table.
-- All catalogue tables are publicly readable for `is_active = true` rows.
-- Writes require staff or admin.

------------------------------------------------------------------------
-- categories
------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories (id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_active_idx on public.categories (is_active);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "categories_staff_write" on public.categories;
create policy "categories_staff_write"
  on public.categories for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- collections
------------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subtitle text,
  description text,
  hero_image_url text,
  launch_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_active_idx on public.collections (is_active);
create index if not exists collections_featured_idx on public.collections (is_featured);

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

alter table public.collections enable row level security;

drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read"
  on public.collections for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "collections_staff_write" on public.collections;
create policy "collections_staff_write"
  on public.collections for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- products
------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  full_description text,
  category_id uuid references public.categories (id) on delete set null,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  currency text not null default 'KES',
  care_instructions text,
  fit_notes text,
  meta_title text,
  meta_description text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_compare_at_gte_price
    check (compare_at_price_cents is null or compare_at_price_cents >= price_cents)
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_featured_idx on public.products (is_featured);
create index if not exists products_published_idx on public.products (published_at desc);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (is_active = true or public.is_staff_or_admin());

drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write"
  on public.products for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- product_images
------------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id);
create index if not exists product_images_cover_idx
  on public.product_images (product_id) where is_cover = true;

create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and (p.is_active = true or public.is_staff_or_admin())
    )
  );

drop policy if exists "product_images_staff_write" on public.product_images;
create policy "product_images_staff_write"
  on public.product_images for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- product_variants
------------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text,
  color text,
  material text,
  -- Jewelry-specific attributes
  metal text,                          -- e.g. 'brass', 'sterling silver', '14k gold'
  gemstone text,
  ring_size text,
  chain_length_cm numeric(6, 2),
  -- Stock & pricing
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  price_override_cents integer check (price_override_cents is null or price_override_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_reserved_lte_stock
    check (reserved_quantity <= stock_quantity)
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists product_variants_active_idx on public.product_variants (is_active);
create index if not exists product_variants_low_stock_idx
  on public.product_variants (stock_quantity) where is_active = true;

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
  on public.product_variants for select
  to anon, authenticated
  using (
    (is_active = true and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and (p.is_active = true or public.is_staff_or_admin())
    ))
    or public.is_staff_or_admin()
  );

-- Stock and pricing cannot be mutated from the browser; reserved_quantity
-- is only adjusted by the service role.
drop policy if exists "product_variants_staff_write" on public.product_variants;
create policy "product_variants_staff_write"
  on public.product_variants for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

------------------------------------------------------------------------
-- product_collections
------------------------------------------------------------------------
create table if not exists public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, collection_id)
);

create index if not exists product_collections_collection_idx
  on public.product_collections (collection_id);

alter table public.product_collections enable row level security;

drop policy if exists "product_collections_public_read" on public.product_collections;
create policy "product_collections_public_read"
  on public.product_collections for select
  to anon, authenticated
  using (true);

drop policy if exists "product_collections_staff_write" on public.product_collections;
create policy "product_collections_staff_write"
  on public.product_collections for all
  to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
