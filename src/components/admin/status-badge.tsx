import * as React from 'react';

import { cn } from '@/lib/utils';

type Variant =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'
  | 'pending'
  | 'authorized'
  | 'failed'
  | 'active'
  | 'inactive'
  | 'archived'
  | 'percentage'
  | 'fixed_amount'
  | 'staff'
  | 'admin'
  | 'customer'
  | 'low_stock'
  | 'in_stock';

const VARIANT_STYLES: Record<Variant, string> = {
  pending_payment: 'border-amber-400/50 text-amber-700 bg-amber-50',
  paid: 'border-emerald-500/40 text-emerald-700 bg-emerald-50',
  processing: 'border-sky-500/40 text-sky-700 bg-sky-50',
  shipped: 'border-indigo-500/40 text-indigo-700 bg-indigo-50',
  delivered: 'border-emerald-600/40 text-emerald-800 bg-emerald-100',
  cancelled: 'border-rose-500/40 text-rose-700 bg-rose-50',
  returned: 'border-rose-500/40 text-rose-700 bg-rose-50',
  refunded: 'border-rose-500/40 text-rose-700 bg-rose-50',

  pending: 'border-amber-400/50 text-amber-700 bg-amber-50',
  authorized: 'border-sky-500/40 text-sky-700 bg-sky-50',
  failed: 'border-rose-500/40 text-rose-700 bg-rose-50',

  active: 'border-emerald-500/40 text-emerald-700 bg-emerald-50',
  inactive: 'border-zinc-500/40 text-zinc-700 bg-zinc-50',
  archived: 'border-zinc-500/40 text-zinc-700 bg-zinc-50',

  percentage: 'border-sky-500/40 text-sky-700 bg-sky-50',
  fixed_amount: 'border-amber-500/40 text-amber-700 bg-amber-50',

  staff: 'border-indigo-500/40 text-indigo-700 bg-indigo-50',
  admin: 'border-rose-500/40 text-rose-700 bg-rose-50',
  customer: 'border-zinc-500/40 text-zinc-700 bg-zinc-50',

  low_stock: 'border-amber-500/40 text-amber-700 bg-amber-50',
  in_stock: 'border-emerald-500/40 text-emerald-700 bg-emerald-50',
};

const LABEL: Record<Variant, string> = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
  pending: 'Pending',
  authorized: 'Authorized',
  failed: 'Failed',
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
  percentage: 'Percentage',
  fixed_amount: 'Fixed amount',
  staff: 'Staff',
  admin: 'Admin',
  customer: 'Customer',
  low_stock: 'Low stock',
  in_stock: 'In stock',
};

interface StatusBadgeProps {
  variant: Variant;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({ variant, className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border px-2 py-0.5 text-eyebrow uppercase tracking-wide',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children ?? LABEL[variant]}
    </span>
  );
}
