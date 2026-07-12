import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getAdminDiscount } from '@/lib/admin/queries/discounts';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { StatusBadge } from '@/components/admin/status-badge';
import { DiscountForm } from '../discount-form';
import {
  updateDiscountAction,
  archiveDiscountAction,
  reactivateDiscountAction,
} from '@/lib/admin/actions/discounts';
import { DiscountArchiveButton } from './discount-archive-button';

export const metadata = { title: 'Admin · Edit discount' };
export const dynamic = 'force-dynamic';

export default async function AdminEditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/discounts');
  const { id } = await params;
  const discount = await getAdminDiscount(id);
  if (!discount) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All discounts
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,18rem]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-muted-foreground">{discount.is_active ? 'Active' : 'Inactive'}</p>
            <h1 className="mt-1 font-mono text-3xl">{discount.code}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {discount.kind === 'percentage'
                ? `${formatNumber(discount.value / 100)}% off`
                : `${formatCurrency(discount.value, { currency: 'KES' })} off`}{' '}
              · {discount.applies_to}
            </p>
          </div>
          <DiscountForm
            discountId={discount.id}
            initialValues={{
              code: discount.code,
              description: discount.description,
              kind: discount.kind,
              appliesTo: discount.applies_to,
              value: discount.value,
              minSubtotalCents: discount.min_subtotal_cents,
              maxRedemptions: discount.max_redemptions,
              startsAt: discount.starts_at,
              endsAt: discount.ends_at,
              isActive: discount.is_active,
            }}
            saveAction={async (input) => {
              if (!input.id) return { ok: false, error: 'Missing discount id.' };
              const res = await updateDiscountAction({ ...input, id: input.id });
              return res.ok
                ? { ok: true as const, data: { id: input.id } }
                : { ok: false as const, error: res.error };
            }}
          />
        </div>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Snapshot</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Redemptions</dt>
                <dd className="font-medium">
                  {discount.redemptions_count}
                  {discount.max_redemptions ? ` / ${discount.max_redemptions}` : ''}
                </dd>
              </div>
              {discount.starts_at ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Starts</dt>
                  <dd className="font-medium">
                    {formatDate(discount.starts_at, { dateStyle: 'medium' })}
                  </dd>
                </div>
              ) : null}
              {discount.ends_at ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Ends</dt>
                  <dd className="font-medium">
                    {formatDate(discount.ends_at, { dateStyle: 'medium' })}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge variant={discount.is_active ? 'active' : 'archived'}>
                    {discount.is_active ? 'active' : 'inactive'}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
          </div>
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Danger zone</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Toggling this flips <span className="font-mono">{discount.code}</span> between active and inactive.
            </p>
            <DiscountArchiveButton
              discountId={discount.id}
              isActive={discount.is_active}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
