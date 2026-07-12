import type { OrderStatus } from '@/types/database';

/**
 * Order status state machine.
 *
 * The state machine is the single source of truth for which transitions
 * a staff member is allowed to perform on an order. It is enforced in
 * `updateOrderStatusAction` and surfaced in the order detail UI to limit
 * the "change status" select options.
 *
 * Terminal states (`cancelled`, `refunded`) cannot be transitioned out of.
 */
const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
};

export function allowedTransitions(from: OrderStatus): readonly OrderStatus[] {
  return ALLOWED[from] ?? [];
}

export function isTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
  return (ALLOWED[from] ?? []).includes(to);
}

/** Human-readable label for a status — used by StatusBadge + admin UI. */
export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending_payment':
      return 'Pending payment';
    case 'paid':
      return 'Paid';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'returned':
      return 'Returned';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
}

export const ALL_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

/** The status column updated when an order enters the given state. */
export function statusTimestampColumn(status: OrderStatus): 'paid_at' | 'shipped_at' | 'delivered_at' | 'cancelled_at' | null {
  switch (status) {
    case 'paid':
      return 'paid_at';
    case 'shipped':
      return 'shipped_at';
    case 'delivered':
      return 'delivered_at';
    case 'cancelled':
      return 'cancelled_at';
    default:
      return null;
  }
}
