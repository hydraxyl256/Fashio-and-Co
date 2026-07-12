'use server';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { slugify, nextAvailableSlug } from '@/lib/admin';

export type SlugCheckResult =
  | { ok: true; data?: { slug: string; available: boolean; suggestion?: string } }
  | { ok: false; error: string };

export async function checkCategorySlugAction(input: { desired: string; ignoreId?: string }): Promise<SlugCheckResult> {
  await requireStaffOrAdmin('/admin/categories');
  const desired = slugify(input.desired);
  if (!desired) return { ok: false, error: 'Slug is empty.' };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .neq('id', input.ignoreId ?? '00000000-0000-0000-0000-000000000000')
    .limit(500);
  const taken = (data ?? []).map((r) => r.slug);
  if (!taken.includes(desired)) return { ok: true, data: { slug: desired, available: true } };
  return { ok: true, data: { slug: desired, available: false, suggestion: nextAvailableSlug(desired, taken) } };
}

export async function checkCollectionSlugAction(input: { desired: string; ignoreId?: string }): Promise<SlugCheckResult> {
  await requireStaffOrAdmin('/admin/collections');
  const desired = slugify(input.desired);
  if (!desired) return { ok: false, error: 'Slug is empty.' };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('collections')
    .select('slug')
    .neq('id', input.ignoreId ?? '00000000-0000-0000-0000-000000000000')
    .limit(500);
  const taken = (data ?? []).map((r) => r.slug);
  if (!taken.includes(desired)) return { ok: true, data: { slug: desired, available: true } };
  return { ok: true, data: { slug: desired, available: false, suggestion: nextAvailableSlug(desired, taken) } };
}
