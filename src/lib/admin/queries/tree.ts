import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CollectionRow = Database['public']['Tables']['collections']['Row'];

export async function listAdminCategories() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  return (data ?? []) as CategoryRow[];
}

export async function getAdminCategory(id: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: category }, { data: allCategories }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('id, name, slug').order('name'),
  ]);
  return {
    category: (category ?? null) as CategoryRow | null,
    candidates: (allCategories ?? []) as Pick<CategoryRow, 'id' | 'name' | 'slug'>[],
  };
}

export interface AdminCollectionRow extends CollectionRow {
  productsCount: number;
}

export async function listAdminCollections(): Promise<AdminCollectionRow[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: collections }, { data: join }] = await Promise.all([
    supabase
      .from('collections')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('launch_at', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true }),
    supabase.from('product_collections').select('collection_id, product_id'),
  ]);
  const counts = new Map<string, number>();
  for (const row of join ?? []) {
    counts.set(row.collection_id, (counts.get(row.collection_id) ?? 0) + 1);
  }
  return ((collections ?? []) as CollectionRow[]).map((c) => ({
    ...c,
    productsCount: counts.get(c.id) ?? 0,
  }));
}

export async function getAdminCollection(id: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: collection }, { data: join }, { data: products }] = await Promise.all([
    supabase.from('collections').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('product_collections')
      .select('product_id, display_order')
      .eq('collection_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select('id, name, slug, is_active')
      .order('name', { ascending: true })
      .limit(500),
  ]);
  const assigned = new Map<string, number>();
  for (const row of join ?? []) {
    assigned.set(row.product_id, row.display_order);
  }
  return {
    collection: (collection ?? null) as CollectionRow | null,
    products: (products ?? []) as Array<Pick<Database['public']['Tables']['products']['Row'], 'id' | 'name' | 'slug' | 'is_active'>>,
    assignments: assigned,
  };
}

export async function isCategorySlugTaken(slug: string, ignoreId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('categories').select('id').eq('slug', slug).limit(1);
  if (ignoreId) q = q.neq('id', ignoreId);
  const { data } = await q.maybeSingle();
  return !!data;
}

export async function isCollectionSlugTaken(slug: string, ignoreId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('collections').select('id').eq('slug', slug).limit(1);
  if (ignoreId) q = q.neq('id', ignoreId);
  const { data } = await q.maybeSingle();
  return !!data;
}
