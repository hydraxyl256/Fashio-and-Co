import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type MovementRow = Database['public']['Tables']['inventory_movements']['Row'];

export interface AdminVariantWithProduct extends VariantRow {
  product: { id: string; name: string; slug: string; is_active: boolean } | null;
}

export async function getVariantsForProduct(productId: string): Promise<AdminVariantWithProduct[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('product_variants')
    .select(
      `*, product:products!product_variants_product_id_fkey (id, name, slug, is_active)`,
    )
    .eq('product_id', productId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  return (data ?? []) as unknown as AdminVariantWithProduct[];
}

export async function getVariantForAdjust(variantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: variant, data: product, data: movements } = await Promise.all([
    supabase
      .from('product_variants')
      .select('*')
      .eq('id', variantId)
      .maybeSingle(),
    supabase
      .from('products')
      .select('id, name, slug')
      .eq('id', '__no_match__') // overwritten below via the join
      .maybeSingle(),
    supabase
      .from('inventory_movements')
      .select('*')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(50),
  ] as const);
  if (!variant) return null;
  // Fetch the product name directly through a second query (RLS-safe).
  const { data: prod } = await supabase
    .from('products')
    .select('id, name, slug, is_active')
    .eq('id', (variant as VariantRow).product_id)
    .maybeSingle();
  return {
    variant: variant as VariantRow,
    product: prod ?? null,
    movements: (movements ?? []) as MovementRow[],
  };
}

export interface LowStockEntry {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  sku: string;
  size: string | null;
  color: string | null;
  metal: string | null;
  material: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  available: number;
}

export async function getLowStockVariants(limit = 8): Promise<LowStockEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('low_stock_variants')
    .select('*')
    .order('available', { ascending: true })
    .limit(limit);
  return (data ?? []) as unknown as LowStockEntry[];
}
