'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/admin';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const zoneSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  country: z.string().min(2).max(8).default('KE'),
  region: z.string().max(80).optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(1000).default(0),
});

export async function createDeliveryZoneAction(
  input: z.input<typeof zoneSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid zone.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('delivery_zones')
    .insert({
      name: parsed.data.name,
      country: parsed.data.country,
      region: parsed.data.region ?? null,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not create the zone.' };
  await logAudit({
    action: 'delivery_zone.create',
    entityType: 'delivery_zone',
    entityId: data.id,
    metadata: { name: parsed.data.name, actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true, data: { id: data.id } };
}

export async function updateDeliveryZoneAction(
  input: z.input<typeof zoneSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  if (!input.id) return { ok: false, error: 'Missing zone id.' };
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid zone.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('delivery_zones')
    .update({
      name: parsed.data.name,
      country: parsed.data.country,
      region: parsed.data.region ?? null,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    .eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'delivery_zone.update',
    entityType: 'delivery_zone',
    entityId: input.id,
    metadata: { name: parsed.data.name, actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true };
}

export async function deleteDeliveryZoneAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  if (!id) return { ok: false, error: 'Missing zone id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'delivery_zone.delete',
    entityType: 'delivery_zone',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true };
}

const rateSchema = z.object({
  id: z.string().uuid().optional(),
  zone_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().nullable(),
  price_cents: z.coerce.number().int().min(0).max(10_000_000),
  free_threshold_cents: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  eta_min_days: z.coerce.number().int().min(0).max(60).optional().nullable(),
  eta_max_days: z.coerce.number().int().min(0).max(60).optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(1000).default(0),
});

export async function createDeliveryRateAction(
  input: z.input<typeof rateSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  const parsed = rateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid rate.' };
  }
  const data = parsed.data;
  if (data.eta_min_days != null && data.eta_max_days != null && data.eta_max_days < data.eta_min_days) {
    return { ok: false, error: 'The maximum ETA must be at least the minimum.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from('delivery_rates')
    .insert({
      zone_id: data.zone_id,
      name: data.name,
      description: data.description ?? null,
      price_cents: data.price_cents,
      free_threshold_cents: data.free_threshold_cents ?? null,
      eta_min_days: data.eta_min_days ?? null,
      eta_max_days: data.eta_max_days ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select('id')
    .single();
  if (error || !row) return { ok: false, error: error?.message ?? 'Could not create the rate.' };
  await logAudit({
    action: 'delivery_rate.create',
    entityType: 'delivery_rate',
    entityId: row.id,
    metadata: { zoneId: data.zone_id, name: data.name, actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true, data: { id: row.id } };
}

export async function updateDeliveryRateAction(
  input: z.input<typeof rateSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  if (!input.id) return { ok: false, error: 'Missing rate id.' };
  const parsed = rateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid rate.' };
  }
  const data = parsed.data;
  if (data.eta_min_days != null && data.eta_max_days != null && data.eta_max_days < data.eta_min_days) {
    return { ok: false, error: 'The maximum ETA must be at least the minimum.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('delivery_rates')
    .update({
      zone_id: data.zone_id,
      name: data.name,
      description: data.description ?? null,
      price_cents: data.price_cents,
      free_threshold_cents: data.free_threshold_cents ?? null,
      eta_min_days: data.eta_min_days ?? null,
      eta_max_days: data.eta_max_days ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'delivery_rate.update',
    entityType: 'delivery_rate',
    entityId: input.id,
    metadata: { zoneId: data.zone_id, name: data.name, actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true };
}

export async function deleteDeliveryRateAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/delivery');
  if (!id) return { ok: false, error: 'Missing rate id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('delivery_rates').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'delivery_rate.delete',
    entityType: 'delivery_rate',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/delivery');
  return { ok: true };
}
