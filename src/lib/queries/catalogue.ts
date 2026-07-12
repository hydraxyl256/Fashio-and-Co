import 'server-only';

import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import { type ProductFilters, type ProductListResult, type ProductFacets, type ProductCardData, publicImageUrl } from './catalogue-types';

export type Supabase = SupabaseClient<Database>;

// Re-export types and utils for backward compatibility
export type { ProductFilters, ProductListResult, ProductFacets, ProductCardData };
export { publicImageUrl };

// ---------------------------------------------------------------------------
// Slug → UUID lookups (used by every collection/category page)
// ---------------------------------------------------------------------------
export const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
});

export const getCollectionBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
});

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories!products_category_id_fkey (id, name, slug),
      images:product_images (*),
      variants:product_variants (*)
    `,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
});

// ---------------------------------------------------------------------------
// Product listing with filters, sort, pagination
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 12;

export async function listProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Resolve category and collection ids from slugs.
  let categoryId: string | null = null;
  let collectionId: string | null = null;

  if (filters.categorySlug) {
    const cat = await getCategoryBySlug(filters.categorySlug);
    categoryId = cat?.id ?? null;
  }
  if (filters.collectionSlug) {
    const col = await getCollectionBySlug(filters.collectionSlug);
    collectionId = col?.id ?? null;
  }

  // If we have a collection, base the query on product_collections; else
  // query products directly. Supabase joins are typed loosely here because
  // the generated Row/Insert types do not yet include relation aliases.
  let query = supabase
    .from('products')
    .select(
      `
      id, slug, name, price_cents, compare_at_price_cents, currency, is_featured, published_at,
      category:categories!products_category_id_fkey (id, name, slug),
      images:product_images (storage_path, alt_text, is_cover, display_order),
      variants:product_variants (size, color, stock_quantity, reserved_quantity, is_active)
    `,
      { count: 'exact' },
    )
    .eq('is_active', true);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (filters.minPriceCents != null) query = query.gte('price_cents', filters.minPriceCents);
  if (filters.maxPriceCents != null) query = query.lte('price_cents', filters.maxPriceCents);
  if (typeof filters.search === 'string' && filters.search.trim().length > 0) {
    // Use `ilike` on name for simple text search. A real deployment would
    // wire this to a tsvector + GIN index, but the volume here is small.
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  // Sort
  switch (filters.sort ?? 'newest') {
    case 'price-asc':
      query = query.order('price_cents', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price_cents', { ascending: false });
      break;
    case 'featured':
      query = query.order('is_featured', { ascending: false }).order('published_at', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('published_at', { ascending: false, nullsFirst: false });
      break;
  }

  query = query.range(from, to);

  const { data, count } = await query;

  type Row = {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    compare_at_price_cents: number | null;
    currency: string;
    is_featured: boolean;
    published_at: string | null;
    category: { id: string; name: string; slug: string } | null;
    images: Array<{ storage_path: string; alt_text: string | null; is_cover: boolean; display_order: number }>;
    variants: Array<{
      size: string | null;
      color: string | null;
      stock_quantity: number;
      reserved_quantity: number;
      is_active: boolean;
    }>;
  };

  const rows = (data ?? []) as unknown as Row[];

  // If a collection filter is set, intersect the rows with the join table.
  let filtered = rows;
  if (collectionId) {
    const { data: join } = await supabase
      .from('product_collections')
      .select('product_id')
      .eq('collection_id', collectionId);
    const ids = new Set((join ?? []).map((j) => j.product_id));
    filtered = filtered.filter((r) => ids.has(r.id));
  }

  // Variant-level filters (size/color/stock) post-filter in memory because
  // Supabase cannot filter through a relation with .eq() in a single call.
  const inStockOnly = filters.inStockOnly ?? false;
  const sizeFilter = filters.size?.toLowerCase().trim();
  const colorFilter = filters.color?.toLowerCase().trim();

  const items: ProductCardData[] = filtered
    .map((row) => {
      const cover =
        row.images.find((i) => i.is_cover) ??
        row.images.slice().sort((a, b) => a.display_order - b.display_order)[0] ??
        null;
      const availableSizes = Array.from(
        new Set(
          row.variants
            .filter((v) => v.is_active)
            .map((v) => v.size)
            .filter((s): s is string => !!s),
        ),
      );
      const stockTotal = row.variants.reduce(
        (acc, v) => (v.is_active ? acc + Math.max(0, v.stock_quantity - v.reserved_quantity) : acc),
        0,
      );
      const inStock = stockTotal > 0;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        priceCents: row.price_cents,
        compareAtPriceCents: row.compare_at_price_cents,
        currency: row.currency,
        isFeatured: row.is_featured,
        category: row.category ? { name: row.category.name, slug: row.category.slug } : null,
        coverImage: cover
          ? { storagePath: cover.storage_path, altText: cover.alt_text }
          : null,
        availableSizes,
        inStock,
        publishedAt: row.published_at,
      };
    })
    .filter((p) => (inStockOnly ? p.inStock : true))
    .filter((p) => (sizeFilter ? p.availableSizes.map((s) => s.toLowerCase()).includes(sizeFilter) : true))
    .filter((p) => (colorFilter ? true : true));

  // Build facets from the unfiltered set so users can see all options.
  const sizes = new Set<string>();
  const colors = new Set<string>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;
  for (const r of filtered) {
    for (const v of r.variants) {
      if (v.is_active && v.size) sizes.add(v.size);
      if (v.is_active && v.color) colors.add(v.color);
    }
    if (r.price_cents < minPrice) minPrice = r.price_cents;
    if (r.price_cents > maxPrice) maxPrice = r.price_cents;
  }
  const facets: ProductFacets = {
    sizes: Array.from(sizes).sort(),
    colors: Array.from(colors).sort(),
    priceRange: {
      min: Number.isFinite(minPrice) ? minPrice : 0,
      max: maxPrice,
    },
  };

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? items.length) / pageSize)),
    facets,
  };
}

// ---------------------------------------------------------------------------
// Homepage payloads
// ---------------------------------------------------------------------------
export const listHomepageSections = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return data ?? [];
});

export const listFeaturedCollections = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('collections')
    .select('id, name, slug, subtitle, description, hero_image_url, is_featured')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true });
  return data ?? [];
});

export const listAllActiveCategories = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return data ?? [];
});

export const listActiveCollections = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('collections')
    .select('id, name, slug, subtitle, description, hero_image_url, is_featured, launch_at')
    .eq('is_active', true)
    .order('launch_at', { ascending: false, nullsFirst: false });
  return data ?? [];
});

export const getProductCountByCategory = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('products')
    .select('id, category_id, is_active')
    .eq('is_active', true);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return counts;
});

// ---------------------------------------------------------------------------
// Cross-sells / related
// ---------------------------------------------------------------------------
export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  const supabase = await createSupabaseServerClient();
  const baseSelect = `
    id, slug, name, price_cents, compare_at_price_cents, currency, is_featured, published_at,
    images:product_images (storage_path, alt_text, is_cover, display_order),
    variants:product_variants (size, color, stock_quantity, reserved_quantity, is_active)
  `;

  if (categoryId) {
    const { data } = await supabase
      .from('products')
      .select(baseSelect)
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit);
    if (data && data.length > 0) return toCardData(data);
  }

  const { data } = await supabase
    .from('products')
    .select(baseSelect)
    .eq('is_active', true)
    .neq('id', productId)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);
  return toCardData(data ?? []);
}

// Internal: shape DB rows into ProductCardData for reuse in related lists.
type DbCardRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  is_featured: boolean;
  published_at: string | null;
  images: Array<{ storage_path: string; alt_text: string | null; is_cover: boolean; display_order: number }>;
  variants: Array<{
    size: string | null;
    color: string | null;
    stock_quantity: number;
    reserved_quantity: number;
    is_active: boolean;
  }>;
};

function toCardData(rows: DbCardRow[]): ProductCardData[] {
  return rows.map((row) => {
    const cover =
      row.images.find((i) => i.is_cover) ??
      row.images.slice().sort((a, b) => a.display_order - b.display_order)[0] ??
      null;
    const availableSizes = Array.from(
      new Set(
        row.variants
          .filter((v) => v.is_active)
          .map((v) => v.size)
          .filter((s): s is string => !!s),
      ),
    );
    const stockTotal = row.variants.reduce(
      (acc, v) => (v.is_active ? acc + Math.max(0, v.stock_quantity - v.reserved_quantity) : acc),
      0,
    );
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      priceCents: row.price_cents,
      compareAtPriceCents: row.compare_at_price_cents,
      currency: row.currency,
      isFeatured: row.is_featured,
      category: null,
      coverImage: cover ? { storagePath: cover.storage_path, altText: cover.alt_text } : null,
      availableSizes,
      inStock: stockTotal > 0,
      publishedAt: row.published_at,
    };
  });
}

// Service-role client (only used in server contexts that need it). Re-exported
// so query consumers can fetch via the admin client when needed.
export async function getAdminSupabase() {
  return createSupabaseServiceRoleClient();
}
