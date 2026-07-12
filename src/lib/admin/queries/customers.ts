import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface AdminCustomerRow {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpentCents: number;
}

export interface AdminCustomerListResult {
  items: AdminCustomerRow[];
  pagination: PageSummary;
}

export async function listAdminCustomers(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminCustomerListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25 },
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, phone, created_at', { count: 'exact' });
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`email.ilike.${term},full_name.ilike.${term},phone.ilike.${term}`);
  }
  query = query.order('created_at', { ascending: false }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as Pick<ProfileRow, 'id' | 'email' | 'full_name' | 'phone' | 'created_at'>[]);

  // Pull aggregates for the visible page only (small enough to be fine).
  const ids = rows.map((r) => r.id);
  const { data: orderAgg } = ids.length
    ? await supabase
        .from('orders')
        .select('user_id, total_cents, status')
        .in('user_id', ids)
    : { data: [] as Array<{ user_id: string | null; total_cents: number; status: string }> };

  const totals = new Map<string, { count: number; total: number }>();
  for (const o of orderAgg ?? []) {
    if (!o.user_id) continue;
    const cur = totals.get(o.user_id) ?? { count: 0, total: 0 };
    cur.count += 1;
    if (o.status !== 'cancelled' && o.status !== 'refunded') {
      cur.total += o.total_cents;
    }
    totals.set(o.user_id, cur);
  }

  const items: AdminCustomerRow[] = rows.map((row) => {
    const agg = totals.get(row.id) ?? { count: 0, total: 0 };
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      createdAt: row.created_at,
      ordersCount: agg.count,
      totalSpentCents: agg.total,
    };
  });

  return { items, pagination: summarize({ page, pageSize }, count ?? items.length) };
}
