'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin, requireStaffOrAdmin, getSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/admin';
import type { UserRole } from '@/types/database';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['customer', 'staff', 'admin']),
});

/**
 * Promote or demote a user's role. Admin-only. Refuses to demote the
 * signed-in admin away from admin (to prevent accidental lockouts).
 */
export async function updateUserRoleAction(
  input: z.input<typeof roleSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin('/admin/staff');
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid role update.' };
  }
  if (parsed.data.userId === session.user.id && parsed.data.role !== 'admin') {
    return { ok: false, error: 'You cannot demote yourself. Ask another admin to do it.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: fetchErr } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', parsed.data.userId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  const previousRole = (existing?.role ?? 'customer') as UserRole;
  let error: { message: string } | null = null;
  if (existing) {
    ({ error } = await supabase
      .from('user_roles')
      .update({ role: parsed.data.role })
      .eq('user_id', parsed.data.userId));
  } else {
    ({ error } = await supabase
      .from('user_roles')
      .insert({ user_id: parsed.data.userId, role: parsed.data.role }));
  }
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'user.role_update',
    entityType: 'profile',
    entityId: parsed.data.userId,
    metadata: { from: previousRole, to: parsed.data.role, actor: session.user.id },
  });
  revalidatePath('/admin/staff');
  return { ok: true };
}

const settingsSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.unknown(),
});

/**
 * Upsert a key into the `house_settings` table. Admin only.
 */
export async function updateHouseSettingAction(
  input: z.input<typeof settingsSchema>,
): Promise<ActionResult> {
  const session = await requireAdmin('/admin/settings');
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid setting.' };
  }
  const admin = await createSupabaseServiceRoleClient();
  const { error } = await admin
    .from('house_settings')
    .upsert(
      {
        key: parsed.data.key,
        value: (parsed.data.value ?? {}) as Record<string, unknown>,
        updated_by: session.user.id,
      },
      { onConflict: 'key' },
    );
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'house_setting.update',
    entityType: 'house_setting',
    entityId: parsed.data.key,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function getHouseSettings() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('house_settings').select('*');
  return data ?? [];
}
