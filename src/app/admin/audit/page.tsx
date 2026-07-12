import { requireAdmin } from '@/lib/auth/session';
import { listAuditLogs } from '@/lib/admin/queries/users';
import { formatDate } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable, type AdminColumn } from '@/components/admin/admin-table';
import { RoleBadge } from '@/components/admin/role-badge';
import type { AuditLogRow } from '@/lib/admin/queries/users';

export const metadata = { title: 'Admin · Audit log' };
export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  await requireAdmin('/admin/audit');
  const logs = await listAuditLogs(500);

  const columns: AdminColumn<AuditLogRow>[] = [
    {
      header: 'When',
      headerClassName: 'w-44',
      className: 'text-xs text-muted-foreground whitespace-nowrap',
      mobileLabel: 'When',
      cell: (row) => formatDate(row.createdAt, { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      header: 'Actor',
      headerClassName: 'w-56',
      mobileLabel: 'Actor',
      cell: (row) => (
        <div>
          <p className="font-mono text-xs">{row.actorId ? row.actorId.slice(0, 8) : 'system'}</p>
          {row.actorRole ? (
            <p className="mt-1">
              <RoleBadge role={row.actorRole} />
            </p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Action',
      headerClassName: 'w-48',
      mobileLabel: 'Action',
      cell: (row) => <span className="font-mono text-xs">{row.action}</span>,
    },
    {
      header: 'Entity',
      mobileLabel: 'Entity',
      cell: (row) => (
        <div>
          <p className="text-xs">{row.entityType ?? '—'}</p>
          {row.entityId ? (
            <p className="font-mono text-xs text-muted-foreground">{row.entityId.slice(0, 8)}</p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Metadata',
      mobileLabel: 'Metadata',
      className: 'text-xs',
      cell: (row) => (
        <pre className="max-w-md overflow-x-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
          {Object.keys(row.metadata).length > 0 ? JSON.stringify(row.metadata, null, 2) : '—'}
        </pre>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Every privileged write the system performs. The most recent 500 events are shown."
      />
      <p className="text-xs text-muted-foreground">{logs.length} events on this page.</p>
      <AdminTable
        rowKey={(r) => r.id}
        columns={columns}
        data={logs}
        emptyMessage="No audit events recorded yet."
      />
    </div>
  );
}
