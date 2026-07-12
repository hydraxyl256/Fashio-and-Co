'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/admin';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const adjustSchema = z.object({
  variantId: z.string().uuid(),
  delta: z.coerce.number().int().refine((n) => n !== 0, 'Delta must be non-zero'),
  reason: z.enum(['restock', 'sale', 'return', 'adjustment', 'reservation', 'release']),
  note: z.string().max(500).optional(),
  orderId: z.string().uuid().optional(),
});

/**
 * Adjust stock through a single inventory_movements row. The apply_inventory_movement
 * RPC handles the atomic stock update + movement insert and refuses to take
 * stock below zero or below the reserved_quantity floor.
 */
export async function adjustStockAction(
  input: z.input<typeof adjustSchema>,
): Promise<ActionResult<{ newStock: number }>> {
  const session = await requireStaffOrAdmin('/admin/inventory');
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid stock adjustment.' };
  }
  const admin = await createSupabaseServiceRoleClient();
  const { data: variant, error: fetchErr } = await admin
    .from('product_variants')
    .select('id, product_id, stock_quantity, sku')
    .eq('id', parsed.data.variantId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!variant) return { ok: false, error: 'Variant not found.' };

  const { data: newStock, error: rpcErr } = await admin.rpc('apply_inventory_movement', {
    p_variant_id: parsed.data.variantId,
    p_delta: parsed.data.delta,
    p_reason: parsed.data.reason,
    p_note: parsed.data.note ?? null,
    p_order_id: parsed.data.orderId ?? null,
  });
  if (rpcErr) {
    return {
      ok: false,
      error:
        rpcErr.message.includes('Insufficient stock')
          ? 'There is not enough stock to apply that change. The DB refused the move.'
          : rpcErr.message,
    };
  }
  await logAudit({
    action: 'inventory.adjust',
    entityType: 'variant',
    entityId: parsed.data.variantId,
    metadata: {
      from: variant.stock_quantity,
      to: typeof newStock === 'number' ? newStock : null,
      delta: parsed.data.delta,
      reason: parsed.data.reason,
      note: parsed.data.note ?? null,
      actor: session.user.id,
    },
  });
  revalidatePath(`/admin/products/${variant.product_id}/inventory`);
  revalidatePath(`/admin/products/${variant.product_id}`);
  return { ok: true, data: { newStock: typeof newStock === 'number' ? newStock : 0 } };
}
