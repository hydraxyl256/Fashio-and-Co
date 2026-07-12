'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { logAudit, slugify, nextAvailableSlug } from '@/lib/admin';
import { isCategorySlugTaken, isCollectionSlugTaken } from '@/lib/admin/queries/tree';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categoryUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  display_order: z.coerce.number().int().min(0).max(100_000).default(0),
  is_active: z.coerce.boolean().default(true),
});

async function ensureUniqueCategorySlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  desired: string,
  ignoreId?: string,
): Promise<string> {
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .neq('id', ignoreId ?? '00000000-0000-0000-0000-000000000000')
    .limit(500);
  return nextAvailableSlug(desired, (data ?? []).map((r) => r.slug));
}

export async function createCategoryAction(
  input: z.input<typeof categoryUpsertSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireStaffOrAdmin('/admin/categories');
  const parsed = categoryUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid category details.' };
  }
  if (parsed.data.id) {
    return { ok: false, error: 'Use updateCategoryAction to modify an existing category.' };
  }
  const supabase = await createSupabaseServerClient();
  const desired = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const slug = await ensureUniqueCategorySlug(supabase, desired);
  const { id: _ignore, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...rest, slug })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the category.' };
  }
  await logAudit({
    action: 'category.create',
    entityType: 'category',
    entityId: data.id,
    metadata: { name: parsed.data.name, slug, actor: session.user.id },
  });
  revalidatePath('/admin/categories');
  return { ok: true, data: { id: data.id, slug } };
}

export async function updateCategoryAction(
  input: z.input<typeof categoryUpsertSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/categories');
  if (!input.id) return { ok: false, error: 'Missing category id.' };
  const parsed = categoryUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid category details.' };
  }
  if (!parsed.data.id) return { ok: false, error: 'Missing category id.' };
  const { id, slug: _ignoreSlug, ...rest } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('categories').update(rest).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'category.update',
    entityType: 'category',
    entityId: id,
    metadata: { name: parsed.data.name, actor: session.user.id },
  });
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${id}`);
  return { ok: true };
}

export async function archiveCategoryAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/categories');
  if (!id) return { ok: false, error: 'Missing category id.' };
  const supabase = await createSupabaseServerClient();
  // Archive (don't delete) — products may still be attached.
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'category.archive',
    entityType: 'category',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/categories');
  return { ok: true };
}

export async function restoreCategoryAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/categories');
  if (!id) return { ok: false, error: 'Missing category id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('categories')
    .update({ is_active: true })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'category.restore',
    entityType: 'category',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/categories');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
const collectionUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(120).optional(),
  subtitle: z.string().max(280).optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  hero_image_url: z.string().url().optional().nullable().or(z.literal('')),
  launch_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
  product_ids: z.array(z.string().uuid()).default([]),
});

async function ensureUniqueCollectionSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  desired: string,
  ignoreId?: string,
): Promise<string> {
  const { data } = await supabase
    .from('collections')
    .select('slug')
    .neq('id', ignoreId ?? '00000000-0000-0000-0000-000000000000')
    .limit(500);
  return nextAvailableSlug(desired, (data ?? []).map((r) => r.slug));
}

function normaliseHeroImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createCollectionAction(
  input: z.input<typeof collectionUpsertSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireStaffOrAdmin('/admin/collections');
  const parsed = collectionUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid collection details.' };
  }
  if (parsed.data.id) {
    return { ok: false, error: 'Use updateCollectionAction to modify an existing collection.' };
  }
  const supabase = await createSupabaseServerClient();
  const desired = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const slug = await ensureUniqueCollectionSlug(supabase, desired);
  const { id: _ignore, product_ids, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from('collections')
    .insert({ ...rest, slug, hero_image_url: normaliseHeroImageUrl(rest.hero_image_url) })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the collection.' };
  }
  if (product_ids.length > 0) {
    const admin = await createSupabaseServiceRoleClient();
    await admin
      .from('product_collections')
      .insert(
        product_ids.map((productId, index) => ({
          product_id: productId,
          collection_id: data.id,
          display_order: index,
        })),
      );
  }
  await logAudit({
    action: 'collection.create',
    entityType: 'collection',
    entityId: data.id,
    metadata: { name: parsed.data.name, slug, products: product_ids.length, actor: session.user.id },
  });
  revalidatePath('/admin/collections');
  return { ok: true, data: { id: data.id, slug } };
}

export async function updateCollectionAction(
  input: z.input<typeof collectionUpsertSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/collections');
  if (!input.id) return { ok: false, error: 'Missing collection id.' };
  const parsed = collectionUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid collection details.' };
  }
  if (!parsed.data.id) return { ok: false, error: 'Missing collection id.' };
  const { id, slug: _ignoreSlug, product_ids, ...rest } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('collections')
    .update({ ...rest, hero_image_url: normaliseHeroImageUrl(rest.hero_image_url) })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  // Replace product assignments wholesale (simpler than diff).
  const admin = await createSupabaseServiceRoleClient();
  await admin.from('product_collections').delete().eq('collection_id', id);
  if (product_ids.length > 0) {
    await admin.from('product_collections').insert(
      product_ids.map((productId, index) => ({
        product_id: productId,
        collection_id: id,
        display_order: index,
      })),
    );
  }
  await logAudit({
    action: 'collection.update',
    entityType: 'collection',
    entityId: id,
    metadata: { name: parsed.data.name, products: product_ids.length, actor: session.user.id },
  });
  revalidatePath('/admin/collections');
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath(`/collections/${parsed.data.slug ?? ''}`);
  return { ok: true };
}

export async function archiveCollectionAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/collections');
  if (!id) return { ok: false, error: 'Missing collection id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('collections')
    .update({ is_active: false })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'collection.archive',
    entityType: 'collection',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/collections');
  return { ok: true };
}

export async function restoreCollectionAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/collections');
  if (!id) return { ok: false, error: 'Missing collection id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('collections')
    .update({ is_active: true })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'collection.restore',
    entityType: 'collection',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/collections');
  return { ok: true };
}

// Re-export helpers so consumers can ask for "is the slug free?" without
// pulling in a second barrel.
export { isCategorySlugTaken, isCollectionSlugTaken };
