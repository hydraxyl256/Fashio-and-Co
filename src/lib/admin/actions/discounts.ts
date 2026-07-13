'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/admin';
import { slugify } from '@/lib/admin/slug';
import { isDiscountCodeTaken } from '@/lib/admin/queries/discounts';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const discountSchema = z
  .object({
    id: z.string().uuid().optional(),
    code: z
      .string()
      .min(2, 'Code must be at least 2 characters')
      .max(32)
      .transform((v) => v.toUpperCase().trim()),
    description: z.string().max(200).optional().nullable(),
    kind: z.enum(['percentage', 'fixed_amount']),
    applies_to: z.enum(['order', 'shipping', 'product']).default('order'),
    value: z.coerce.number().int().min(1).max(10_000_000),
    min_subtotal_cents: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
    max_redemptions: z.coerce.number().int().min(1).max(1_000_000).optional().nullable(),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
    is_active: z.coerce.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.kind === 'percentage' && data.value > 10_000) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Percentage value must be at most 10000 basis points (100%).',
      });
    }
    if (data.starts_at && data.ends_at && new Date(data.ends_at) <= new Date(data.starts_at)) {
      ctx.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: 'The end date must be after the start date.',
      });
    }
  });

function normalize(input: z.infer<typeof discountSchema>) {
  return {
    code: input.code,
    description: input.description ?? null,
    kind: input.kind,
    applies_to: input.applies_to,
    value: input.value,
    min_subtotal_cents: input.min_subtotal_cents ?? null,
    max_redemptions: input.max_redemptions ?? null,
    starts_at: input.starts_at ?? null,
    ends_at: input.ends_at ?? null,
    is_active: input.is_active,
  };
}

export async function createDiscountAction(
  input: z.input<typeof discountSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireStaffOrAdmin('/admin/discounts');
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid discount details.' };
  }
  if (await isDiscountCodeTaken(parsed.data.code)) {
    return { ok: false, error: 'A discount with that code already exists.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('discount_codes')
    .insert({
      ...normalize(parsed.data),
      created_by: session.user.id,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not create the discount.' };
  await logAudit({
    action: 'discount.create',
    entityType: 'discount',
    entityId: data.id,
    metadata: { code: parsed.data.code, kind: parsed.data.kind, value: parsed.data.value, actor: session.user.id },
  });
  revalidatePath('/admin/discounts');
  return { ok: true, data: { id: data.id } };
}

export async function updateDiscountAction(
  input: z.input<typeof discountSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/discounts');
  if (!input.id) return { ok: false, error: 'Missing discount id.' };
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid discount details.' };
  }
  if (await isDiscountCodeTaken(parsed.data.code, input.id)) {
    return { ok: false, error: 'A different discount already uses that code.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('discount_codes')
    .update(normalize(parsed.data))
    .eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'discount.update',
    entityType: 'discount',
    entityId: input.id,
    metadata: { code: parsed.data.code, actor: session.user.id },
  });
  revalidatePath('/admin/discounts');
  revalidatePath(`/admin/discounts/${input.id}`);
  return { ok: true };
}

export async function archiveDiscountAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/discounts');
  if (!id) return { ok: false, error: 'Missing discount id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('discount_codes').update({ is_active: false }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'discount.archive',
    entityType: 'discount',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/discounts');
  revalidatePath(`/admin/discounts/${id}`);
  return { ok: true };
}

export async function reactivateDiscountAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/discounts');
  if (!id) return { ok: false, error: 'Missing discount id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('discount_codes').update({ is_active: true }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'discount.reactivate',
    entityType: 'discount',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/discounts');
  revalidatePath(`/admin/discounts/${id}`);
  return { ok: true };
}
