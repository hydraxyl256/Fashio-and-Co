import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, UserRole } from '@/types/database';
import { parsePage, summarize, type PageSummary } from '@/lib/admin/pagination';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type RoleRow = Database['public']['Tables']['user_roles']['Row'];

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  role: UserRole;
}

export interface AdminUserFilters {
  role?: UserRole | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminUserListResult {
  items: AdminUserRow[];
  pagination: PageSummary;
}

export async function listAdminUsers(filters: AdminUserFilters = {}): Promise<AdminUserListResult> {
  const supabase = await createSupabaseServerClient();
  const { page, pageSize } = parsePage(
    { page: filters.page?.toString(), pageSize: filters.pageSize?.toString() },
    { pageSize: 25 },
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select(
      `id, email, full_name, phone, created_at,
       role:user_roles!user_roles_user_id_fkey (role)`,
      { count: 'exact' },
    );
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`email.ilike.${term},full_name.ilike.${term}`);
  }
  query = query.order('created_at', { ascending: false }).range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    role: { role: UserRole } | { role: UserRole }[] | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  const items: AdminUserRow[] = rows.map((r) => {
    const roleValue = Array.isArray(r.role) ? r.role[0]?.role ?? 'customer' : r.role?.role ?? 'customer';
    return {
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      phone: r.phone,
      createdAt: r.created_at,
      role: roleValue,
    };
  });

  const filtered = filters.role && filters.role !== 'all' ? items.filter((i) => i.role === filters.role) : items;

  return { items: filtered, pagination: summarize({ page, pageSize }, count ?? filtered.length) };
}

export interface AuditLogRow {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorRole: UserRole | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
}

export async function listAuditLogs(limit = 200): Promise<AuditLogRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return ((data ?? []) as Database['public']['Tables']['audit_logs']['Row'][]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
  }));
}

export type { ProfileRow, RoleRow };
