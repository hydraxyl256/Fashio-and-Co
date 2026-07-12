import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { OrderStatus } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type HistoryRow = Database['public']['Tables']['order_status_history']['Row'];

export interface AdminOrderFilters {
  status?: OrderStatus[];
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminOrderListRow {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  status: OrderStatus;
  placedAt: string;
  totalCents: number;
  currency: string;
  itemsCount: number;
}

export interface AdminOrderListResult {
  items: AdminOrderListRow[];
  pagination: PageSummary;
}

export async function listAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrderListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25, maxPageSize: 100 },
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select(
      `id, order_number, customer_email, customer_full_name, status, placed_at, total_cents, currency,
       items:order_items (id, quantity)`,
      { count: 'exact' },
    );

  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  if (filters.from) query = query.gte('placed_at', filters.from);
  if (filters.to) query = query.lte('placed_at', filters.to);
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`order_number.ilike.${term},customer_email.ilike.${term},customer_phone.ilike.${term}`);
  }

  query = query.order('placed_at', { ascending: false }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    order_number: string;
    customer_email: string;
    customer_full_name: string | null;
    status: OrderStatus;
    placed_at: string;
    total_cents: number;
    currency: string;
    items: Array<{ id: string; quantity: number }>;
  };
  const rows = (data ?? []) as unknown as Row[];

  const items: AdminOrderListRow[] = rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_full_name,
    customerEmail: row.customer_email,
    status: row.status,
    placedAt: row.placed_at,
    totalCents: row.total_cents,
    currency: row.currency,
    itemsCount: (row.items ?? []).reduce((acc, i) => acc + i.quantity, 0),
  }));

  return { items, pagination: summarize({ page, pageSize }, count ?? items.length) };
}

export async function getOrderCountByStatus(): Promise<Record<OrderStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('orders').select('status');
  const counts: Record<OrderStatus, number> = {
    pending_payment: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    refunded: 0,
  };
  for (const row of (data as Array<{ status: OrderStatus }>) ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export interface AdminOrderDetail {
  order: OrderRow;
  items: OrderItemRow[];
  payments: PaymentRow[];
  history: HistoryRow[];
}

export async function getAdminOrderDetail(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data: order }, { data: items }, { data: payments }, { data: history }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
    supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
  ]);
  if (!order) return null;
  return {
    order: order as OrderRow,
    items: (items ?? []) as OrderItemRow[],
    payments: (payments ?? []) as PaymentRow[],
    history: (history ?? []) as HistoryRow[],
  };
}
