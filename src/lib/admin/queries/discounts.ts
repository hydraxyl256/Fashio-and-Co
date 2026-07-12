import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type DiscountRow = Database['public']['Tables']['discount_codes']['Row'];

export interface AdminDiscountFilters {
  status?: 'active' | 'inactive' | 'all';
  kind?: 'percentage' | 'fixed_amount';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminDiscountListResult {
  items: DiscountRow[];
  pagination: PageSummary;
}

export async function listAdminDiscounts(
  filters: AdminDiscountFilters = {},
): Promise<AdminDiscountListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25 },
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('discount_codes')
    .select('*', { count: 'exact' });

  if (filters.status === 'active') query = query.eq('is_active', true);
  if (filters.status === 'inactive') query = query.eq('is_active', false);
  if (filters.kind) query = query.eq('kind', filters.kind);
  if (filters.search && filters.search.trim().length > 0) {
    query = query.ilike('code', `%${filters.search.trim().toUpperCase()}%`);
  }

  query = query.order('updated_at', { ascending: false }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return {
    items: (data ?? []) as DiscountRow[],
    pagination: summarize({ page, pageSize }, count ?? 0),
  };
}

export async function getAdminDiscount(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('discount_codes').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as DiscountRow | null;
}

export async function isDiscountCodeTaken(code: string, ignoreId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('discount_codes').select('id').eq('code', code.toUpperCase()).limit(1);
  if (ignoreId) q = q.neq('id', ignoreId);
  const { data } = await q.maybeSingle();
  return !!data;
}
