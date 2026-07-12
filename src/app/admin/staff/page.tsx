import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/session';
import { listAdminUsers } from '@/lib/admin/queries/users';
import { getSession } from '@/lib/auth/session';
import { formatDate, formatNumber } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { RoleBadge } from '@/components/admin/role-badge';
import { UserRoleSelect } from './user-role-select';

export const metadata = { title: 'Admin · Staff & roles' };
export const dynamic = 'force-dynamic';

type RoleFilter = 'all' | 'customer' | 'staff' | 'admin';

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; role?: string }>;
}) {
  await requireAdmin('/admin/staff');
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const role = (params.role as RoleFilter | undefined) ?? 'all';
  const { items, pagination } = await listAdminUsers({
    role,
    search: params.q,
    page,
    pageSize: 25,
  });
  const session = await getSession();

  const columns: AdminColumn<typeof items[number]>[] = [
    {
      header: 'Account',
      mobileLabel: 'Account',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Joined',
      headerClassName: 'w-32',
      className: 'text-xs text-muted-foreground',
      mobileLabel: 'Joined',
      cell: (row) => formatDate(row.createdAt, { dateStyle: 'medium' }),
    },
    {
      header: 'Role',
      headerClassName: 'w-32',
      mobileLabel: 'Role',
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: 'Change',
      headerClassName: 'w-56',
      mobileLabel: 'Change',
      cell: (row) => (
        <UserRoleSelect
          userId={row.id}
          currentRole={row.role}
          selfId={session?.user.id ?? ''}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="People"
        title="Staff & roles"
        description="Promote teammates to staff or admin. Demoting yourself is not allowed."
      />
      <div className="space-y-3">
        <AdminFilterBar placeholder="Search email or name…">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {(['all', 'admin', 'staff', 'customer'] as RoleFilter[]).map((r) => {
              const active = role === r;
              const next = new URLSearchParams();
              if (params.q) next.set('q', params.q);
              if (r !== 'all') next.set('role', r);
              return (
                <Link
                  key={r}
                  href={next.toString() ? `/admin/staff?${next}` : '/admin/staff'}
                  className={`border px-2 py-1 text-eyebrow uppercase ${
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </AdminFilterBar>
        <p className="text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? 'account' : 'accounts'} matched · page {pagination.page} of {pagination.pageCount}
        </p>
        <AdminTable
          rowKey={(r) => r.id}
          columns={columns}
          data={items}
          emptyMessage="No users match your filters."
        />
        <AdminPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          buildHref={(p) => {
            const next = new URLSearchParams();
            if (params.q) next.set('q', params.q);
            if (role !== 'all') next.set('role', role);
            if (p > 1) next.set('page', String(p));
            const query = next.toString();
            return query ? `/admin/staff?${query}` : '/admin/staff';
          }}
        />
      </div>
    </div>
  );
}
