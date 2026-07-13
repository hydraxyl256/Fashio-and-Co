'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logAudit, isTransitionAllowed } from '@/lib/admin';
import type { OrderStatus } from '@/types/database';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const statusEnum = z.enum([
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
]);

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  toStatus: statusEnum,
  note: z.string().max(1000).optional(),
});

const REASON_FOR_STATUS: Partial<Record<OrderStatus, 'release' | 'return'>> = {
  cancelled: 'release',
  returned: 'return',
};

/**
 * Move an order from its current status to a new one. Enforces the state
 * machine, writes a history row, and (for cancellations / returns) records
 * the necessary inventory release via the apply_inventory_movement RPC.
 */
export async function updateOrderStatusAction(
  input: z.input<typeof updateStatusSchema>,
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/orders');
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid status update.' };
  }
  const { orderId, toStatus, note } = parsed.data;
  const admin = await createSupabaseServiceRoleClient();

  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('id, status, order_number')
    .eq('id', orderId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!order) return { ok: false, error: 'Order not found.' };

  const fromStatus = order.status as OrderStatus;
  if (!isTransitionAllowed(fromStatus, toStatus)) {
    return {
      ok: false,
      error: `Cannot transition order from "${fromStatus}" to "${toStatus}".`,
    };
  }
  if (fromStatus === toStatus) {
    return { ok: true };
  }

  // Use the security-definer helper for the atomic status + history write.
  const { error: rpcErr } = await admin.rpc('record_order_status_change', {
    p_order_id: orderId,
    p_from_status: fromStatus,
    p_to_status: toStatus,
    p_note: note ?? null,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };

  // If the new status releases or returns stock, write inventory movements.
  const movementReason = REASON_FOR_STATUS[toStatus];
  if (movementReason) {
    const { data: items, error: itemsErr } = await admin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);
    if (itemsErr) return { ok: false, error: itemsErr.message };
    for (const item of items ?? []) {
      if (!item.variant_id) continue;
      // Only release stock for cancellations from a non-pending state and
      // returns from delivered/shipped — the policy is "stock that had been
      // committed (sale) is being returned to inventory."
      const delta = movementReason === 'release' ? item.quantity : -item.quantity;
      if (delta === 0) continue;
      const { error: moveErr } = await admin.rpc('apply_inventory_movement', {
        p_variant_id: item.variant_id,
        p_delta: movementReason === 'release' ? item.quantity : -item.quantity,
        p_reason: movementReason,
        p_note: `Auto from order ${order.order_number} status change (${fromStatus} → ${toStatus})`,
        p_order_id: orderId,
      });
      if (moveErr) {
        // Don't roll back the status change — the user already saw the new
        // status — but surface a clear error.
        await logAudit({
          action: 'order.status_change.inventory_failed',
          entityType: 'order',
          entityId: orderId,
          metadata: { fromStatus, toStatus, variantId: item.variant_id, error: moveErr.message, actor: session.user.id },
        });
        return {
          ok: false,
          error: `Status changed, but inventory movement failed: ${moveErr.message}. Reconcile stock manually.`,
        };
      }
    }
  }

  await logAudit({
    action: 'order.status_change',
    entityType: 'order',
    entityId: orderId,
    metadata: { fromStatus, toStatus, note, actor: session.user.id },
  });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

const internalNoteSchema = z.object({
  orderId: z.string().uuid(),
  internalNote: z.string().max(2000).optional(),
});

export async function updateOrderInternalNoteAction(
  input: z.input<typeof internalNoteSchema>,
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/orders');
  const parsed = internalNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid note.' };
  }
  const admin = await createSupabaseServiceRoleClient();
  const { error } = await admin
    .from('orders')
    .update({ internal_note: parsed.data.internalNote ?? null })
    .eq('id', parsed.data.orderId);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'order.internal_note_update',
    entityType: 'order',
    entityId: parsed.data.orderId,
    metadata: { actor: session.user.id },
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { ok: true };
}
