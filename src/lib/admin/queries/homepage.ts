import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, HomepageSectionKind } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type SectionRow = Database['public']['Tables']['homepage_sections']['Row'];

export interface AdminHomepageFilters {
  kind?: HomepageSectionKind;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminHomepageListResult {
  items: SectionRow[];
  pagination: PageSummary;
}

export async function listAdminHomepageSections(
  filters: AdminHomepageFilters = {},
): Promise<AdminHomepageListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25 },
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('homepage_sections').select('*', { count: 'exact' });
  if (filters.kind) query = query.eq('kind', filters.kind);
  if (filters.search && filters.search.trim().length > 0) {
    query = query.ilike('title', `%${filters.search.trim()}%`);
  }
  query = query.order('display_order', { ascending: true }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return {
    items: (data ?? []) as SectionRow[],
    pagination: summarize({ page, pageSize }, count ?? 0),
  };
}

export async function getAdminHomepageSection(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data ?? null) as SectionRow | null;
}

export async function isHomepageSlugTaken(slug: string, ignoreId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('homepage_sections').select('id').eq('slug', slug).limit(1);
  if (ignoreId) q = q.neq('id', ignoreId);
  const { data } = await q.maybeSingle();
  return !!data;
}
