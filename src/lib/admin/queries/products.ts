import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

/** Filter values for the admin product list. */
export interface AdminProductFilters {
  status?: 'active' | 'archived' | 'all';
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'archived';
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  isFeatured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  category: { id: string; name: string; slug: string } | null;
  variantsCount: number;
  stockTotal: number;
  cover: { storagePath: string; alt: string | null } | null;
}

export interface AdminProductListResult {
  items: AdminProductRow[];
  pagination: PageSummary;
}

const DEFAULT_STATUS: NonNullable<AdminProductFilters['status']> = 'all';

export async function listAdminProducts(filters: AdminProductFilters = {}): Promise<AdminProductListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25, maxPageSize: 100 },
  );
  const status = filters.status ?? DEFAULT_STATUS;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(
      `id, slug, name, is_active, published_at, price_cents, compare_at_price_cents, currency,
       is_featured, updated_at,
       category:categories!products_category_id_fkey (id, name, slug),
       images:product_images (storage_path, alt_text, is_cover, display_order),
       variants:product_variants (is_active, stock_quantity, reserved_quantity)`,
      { count: 'exact' },
    );

  if (status === 'active') query = query.eq('is_active', true);
  if (status === 'archived') query = query.eq('is_active', false);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }

  query = query.order('updated_at', { ascending: false }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    slug: string;
    name: string;
    is_active: boolean;
    published_at: string | null;
    price_cents: number;
    compare_at_price_cents: number | null;
    currency: string;
    is_featured: boolean;
    updated_at: string;
    category: { id: string; name: string; slug: string } | null;
    images: Array<{ storage_path: string; alt_text: string | null; is_cover: boolean; display_order: number }>;
    variants: Array<{ is_active: boolean; stock_quantity: number; reserved_quantity: number }>;
  };
  const rows = (data ?? []) as unknown as Row[];

  const items: AdminProductRow[] = rows.map((row) => {
    const cover =
      row.images.find((i) => i.is_cover) ??
      row.images.slice().sort((a, b) => a.display_order - b.display_order)[0] ??
      null;
    const activeVariants = row.variants.filter((v) => v.is_active);
    const stockTotal = activeVariants.reduce(
      (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
      0,
    );
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.is_active ? 'active' : 'archived',
      priceCents: row.price_cents,
      compareAtPriceCents: row.compare_at_price_cents,
      currency: row.currency,
      isFeatured: row.is_featured,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      category: row.category,
      variantsCount: activeVariants.length,
      stockTotal,
      cover: cover ? { storagePath: cover.storage_path, alt: cover.alt_text } : null,
    };
  });

  return { items, pagination: summarize({ page, pageSize }, count ?? items.length) };
}

export async function getProductForEdit(productId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: product }, { data: images }, { data: variants }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', productId).maybeSingle(),
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true }),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
  ]);
  return {
    product: (product ?? null) as ProductRow | null,
    images: (images ?? []) as ProductImageRow[],
    variants: (variants ?? []) as ProductVariantRow[],
    categories: (categories ?? []) as Pick<CategoryRow, 'id' | 'name' | 'slug'>[],
  };
}

export async function getProductCollectionsForAssign(productId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: allCollections }, { data: join }] = await Promise.all([
    supabase
      .from('collections')
      .select('id, name, slug, is_active')
      .order('name', { ascending: true }),
    supabase
      .from('product_collections')
      .select('collection_id, display_order')
      .eq('product_id', productId),
  ]);
  const assigned = new Map<string, number>();
  for (const row of join ?? []) {
    assigned.set(row.collection_id, row.display_order);
  }
  return {
    collections: allCollections ?? [],
    assignments: assigned,
  };
}

export async function isProductSlugTaken(slug: string, ignoreId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('products').select('id').eq('slug', slug).limit(1);
  if (ignoreId) q = q.neq('id', ignoreId);
  const { data } = await q.maybeSingle();
  return !!data;
}
