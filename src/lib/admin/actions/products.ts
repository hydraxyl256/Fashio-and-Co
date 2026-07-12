'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin, getSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { logAudit, slugify, nextAvailableSlug } from '@/lib/admin';
import { StorageValidationError, uploadImage, deleteImage, validateImage } from '@/lib/admin/storage';
import { isProductSlugTaken } from '@/lib/admin/queries/products';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Slug availability (used by the live <SlugInput>)
// ---------------------------------------------------------------------------
const slugCheckSchema = z.object({
  desired: z.string().min(1).max(120),
  ignoreId: z.string().uuid().optional(),
});

export async function checkSlugAvailabilityAction(input: {
  desired: string;
  ignoreId?: string;
}): Promise<ActionResult<{ slug: string; available: boolean; suggestion?: string }>> {
  const parsed = slugCheckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid slug input.' };
  }
  const desired = slugify(parsed.data.desired);
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('products')
    .select('slug')
    .neq('id', parsed.data.ignoreId ?? '00000000-0000-0000-0000-000000000000')
    .order('slug', { ascending: true })
    .limit(200);
  const taken = new Set((existing ?? []).map((r) => r.slug.toLowerCase()));
  if (!taken.has(desired.toLowerCase())) {
    return { ok: true, data: { slug: desired, available: true } };
  }
  const suggestion = nextAvailableSlug(desired, Array.from(taken));
  return { ok: true, data: { slug: desired, available: false, suggestion } };
}

// ---------------------------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------------------------
const variantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1).max(64),
  size: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  material: z.string().max(40).optional().nullable(),
  metal: z.string().max(40).optional().nullable(),
  gemstone: z.string().max(40).optional().nullable(),
  ring_size: z.string().max(20).optional().nullable(),
  chain_length_cm: z.coerce.number().min(0).max(999.99).optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0).max(100_000),
  reserved_quantity: z.coerce.number().int().min(0).max(100_000).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).max(100_000).default(3),
  price_override_cents: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  compare_at_price_cents: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  weight_grams: z.coerce.number().int().min(0).max(100_000).optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  position: z.coerce.number().int().min(0).max(100_000).default(0),
});

const productUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(120).optional(),
  short_description: z.string().max(500).optional().nullable(),
  full_description: z.string().max(8000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  price_cents: z.coerce.number().int().min(0).max(100_000_000),
  compare_at_price_cents: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  currency: z.string().length(3).default('KES'),
  care_instructions: z.string().max(2000).optional().nullable(),
  fit_notes: z.string().max(2000).optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  is_featured: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  published_at: z.string().optional().nullable(),
  variants: z.array(variantSchema).default([]),
});

function ensureUniqueProductSlug(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, desired: string, ignoreId?: string) {
  // Reads slugs to compute the next available one. The returned value is
  // guaranteed to be free at the moment we INSERT/UPDATE.
  return (async () => {
    const { data } = await supabase
      .from('products')
      .select('slug')
      .neq('id', ignoreId ?? '00000000-0000-0000-0000-000000000000')
      .limit(500);
    const taken = (data ?? []).map((r) => r.slug);
    return nextAvailableSlug(desired, taken);
  })();
}

export async function createProductAction(
  input: z.input<typeof productUpsertSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireStaffOrAdmin('/admin/products');
  const parsed = productUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid product details.' };
  }
  const data = parsed.data;
  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueProductSlug(supabase, data.slug ? slugify(data.slug) : slugify(data.name));
  if (data.id) {
    return { ok: false, error: 'Use updateProductAction to modify an existing product.' };
  }
  const { variants, ...rest } = data;
  const { data: created, error } = await supabase
    .from('products')
    .insert({ ...rest, slug })
    .select('id')
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? 'Could not create the product.' };
  }
  if (variants.length > 0) {
    const { error: vErr } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ ...v, product_id: created.id })));
    if (vErr) {
      return { ok: false, error: `Product created, but variants failed: ${vErr.message}` };
    }
  }
  await logAudit({
    action: 'product.create',
    entityType: 'product',
    entityId: created.id,
    metadata: { name: data.name, slug, variants: variants.length, actor: session.user.id },
  });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${created.id}`);
  return { ok: true, data: { id: created.id, slug } };
}

export async function updateProductAction(
  input: z.input<typeof productUpsertSchema> & { id: string },
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!input.id) return { ok: false, error: 'Missing product id.' };
  const parsed = productUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid product details.' };
  }
  const data = parsed.data;
  if (data.id && data.id !== input.id) {
    return { ok: false, error: 'Product id mismatch.' };
  }
  const supabase = await createSupabaseServerClient();
  const desired = data.slug ? slugify(data.slug) : slugify(data.name);
  const slug = await ensureUniqueProductSlug(supabase, desired, input.id);

  const { variants, ...rest } = data;
  const { error } = await supabase
    .from('products')
    .update({ ...rest, slug })
    .eq('id', input.id);
  if (error) {
    return { ok: false, error: error.message };
  }
  // Replace variants wholesale — simpler than diffing for a back-office.
  if (variants) {
    const { error: delErr } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', input.id);
    if (delErr) return { ok: false, error: `Could not reset variants: ${delErr.message}` };
    if (variants.length > 0) {
      const { error: insErr } = await supabase
        .from('product_variants')
        .insert(variants.map((v) => ({ ...v, product_id: input.id })));
      if (insErr) return { ok: false, error: `Could not save variants: ${insErr.message}` };
    }
  }
  await logAudit({
    action: 'product.update',
    entityType: 'product',
    entityId: input.id,
    metadata: { name: data.name, slug, actor: session.user.id },
  });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${input.id}`);
  revalidatePath(`/products/${slug}`);
  return { ok: true, data: { id: input.id, slug } };
}

export async function archiveProductAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!id) return { ok: false, error: 'Missing product id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, published_at: null })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'product.archive', entityType: 'product', entityId: id, metadata: { actor: session.user.id } });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function publishProductAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!id) return { ok: false, error: 'Missing product id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: true, published_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'product.publish', entityType: 'product', entityId: id, metadata: { actor: session.user.id } });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function restoreProductAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!id) return { ok: false, error: 'Missing product id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: true })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'product.restore', entityType: 'product', entityId: id, metadata: { actor: session.user.id } });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Image upload / delete / reorder
// ---------------------------------------------------------------------------
export async function uploadProductImageAction(input: {
  productId: string;
  bytesBase64: string;
  contentType: string;
  altText?: string;
  isCover?: boolean;
  originalName: string;
}): Promise<ActionResult<{ id: string; storagePath: string }>> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!input.productId) return { ok: false, error: 'Missing product id.' };
  let bytes: Uint8Array;
  try {
    const binary = atob(input.bytesBase64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) arr[i] = binary.charCodeAt(i);
    bytes = arr;
  } catch {
    return { ok: false, error: 'Invalid image payload.' };
  }
  try {
    validateImage({ contentType: input.contentType, bytes });
  } catch (err) {
    if (err instanceof StorageValidationError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  let uploaded: Awaited<ReturnType<typeof uploadImage>>;
  try {
    uploaded = await uploadImage({
      productId: input.productId,
      bytes,
      contentType: input.contentType,
      originalName: input.originalName,
    });
  } catch (err) {
    if (err instanceof StorageValidationError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  const supabase = await createSupabaseServerClient();
  // If this is going to be the cover, clear any existing cover first.
  if (input.isCover) {
    await supabase
      .from('product_images')
      .update({ is_cover: false })
      .eq('product_id', input.productId);
  }
  const { data: row, error } = await supabase
    .from('product_images')
    .insert({
      product_id: input.productId,
      storage_path: uploaded.storagePath,
      alt_text: input.altText ?? null,
      is_cover: input.isCover ?? false,
    })
    .select('id')
    .single();
  if (error || !row) {
    // Best-effort rollback to keep storage in sync.
    await deleteImage(uploaded.storagePath).catch(() => undefined);
    return { ok: false, error: error?.message ?? 'Could not record the image.' };
  }
  await logAudit({
    action: 'product.image.upload',
    entityType: 'product',
    entityId: input.productId,
    metadata: { imageId: row.id, isCover: !!input.isCover, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${input.productId}`);
  return { ok: true, data: { id: row.id, storagePath: uploaded.storagePath } };
}

export async function deleteProductImageAction(input: {
  imageId: string;
}): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_images')
    .select('id, product_id, storage_path')
    .eq('id', input.imageId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Image not found.' };
  const { error: delErr } = await supabase.from('product_images').delete().eq('id', input.imageId);
  if (delErr) return { ok: false, error: delErr.message };
  await deleteImage(row.storage_path).catch(() => undefined);
  await logAudit({
    action: 'product.image.delete',
    entityType: 'product',
    entityId: row.product_id,
    metadata: { imageId: input.imageId, storagePath: row.storage_path, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${row.product_id}`);
  return { ok: true };
}

export async function reorderProductImagesAction(input: {
  productId: string;
  orderedIds: string[];
}): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!input.productId || !Array.isArray(input.orderedIds)) {
    return { ok: false, error: 'Invalid reorder request.' };
  }
  const admin = await createSupabaseServiceRoleClient();
  // Use the service role here because the user RLS restricts writes and we
  // need to update many rows quickly with a single round-trip.
  await Promise.all(
    input.orderedIds.map((id, index) =>
      admin
        .from('product_images')
        .update({ display_order: index })
        .eq('id', id)
        .eq('product_id', input.productId),
    ),
  );
  await logAudit({
    action: 'product.image.reorder',
    entityType: 'product',
    entityId: input.productId,
    metadata: { count: input.orderedIds.length, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${input.productId}`);
  return { ok: true };
}

export async function setProductImageCoverAction(input: {
  imageId: string;
}): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_images')
    .select('id, product_id')
    .eq('id', input.imageId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Image not found.' };
  await supabase
    .from('product_images')
    .update({ is_cover: false })
    .eq('product_id', row.product_id);
  await supabase.from('product_images').update({ is_cover: true }).eq('id', input.imageId);
  await logAudit({
    action: 'product.image.set_cover',
    entityType: 'product',
    entityId: row.product_id,
    metadata: { imageId: input.imageId, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${row.product_id}`);
  return { ok: true };
}

export async function updateProductImageAltAction(input: {
  imageId: string;
  altText: string;
}): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_images')
    .select('id, product_id')
    .eq('id', input.imageId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Image not found.' };
  const { error } = await supabase
    .from('product_images')
    .update({ alt_text: input.altText.slice(0, 200) })
    .eq('id', input.imageId);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'product.image.update_alt',
    entityType: 'product',
    entityId: row.product_id,
    metadata: { imageId: input.imageId, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${row.product_id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Variant CRUD (independent from full product upsert — for inventory edits)
// ---------------------------------------------------------------------------
export async function createVariantAction(input: {
  productId: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  metal?: string | null;
  gemstone?: string | null;
  ring_size?: string | null;
  chain_length_cm?: number | null;
  stock_quantity: number;
  reserved_quantity?: number;
  low_stock_threshold?: number;
  price_override_cents?: number | null;
  compare_at_price_cents?: number | null;
  weight_grams?: number | null;
  is_active?: boolean;
  position?: number;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireStaffOrAdmin('/admin/products');
  if (!input.productId) return { ok: false, error: 'Missing product id.' };
  if (!input.sku || input.sku.trim().length === 0) {
    return { ok: false, error: 'SKU is required.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: input.productId,
      sku: input.sku.trim(),
      size: input.size ?? null,
      color: input.color ?? null,
      material: input.material ?? null,
      metal: input.metal ?? null,
      gemstone: input.gemstone ?? null,
      ring_size: input.ring_size ?? null,
      chain_length_cm: input.chain_length_cm ?? null,
      stock_quantity: input.stock_quantity,
      reserved_quantity: input.reserved_quantity ?? 0,
      low_stock_threshold: input.low_stock_threshold ?? 3,
      price_override_cents: input.price_override_cents ?? null,
      compare_at_price_cents: input.compare_at_price_cents ?? null,
      weight_grams: input.weight_grams ?? null,
      is_active: input.is_active ?? true,
      position: input.position ?? 0,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the variant.' };
  }
  await logAudit({
    action: 'variant.create',
    entityType: 'variant',
    entityId: data.id,
    metadata: { productId: input.productId, sku: input.sku, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath(`/admin/products/${input.productId}/inventory`);
  return { ok: true, data: { id: data.id } };
}

export async function updateVariantAction(input: {
  id: string;
  sku?: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  metal?: string | null;
  gemstone?: string | null;
  ring_size?: string | null;
  chain_length_cm?: number | null;
  low_stock_threshold?: number;
  price_override_cents?: number | null;
  compare_at_price_cents?: number | null;
  weight_grams?: number | null;
  is_active?: boolean;
  position?: number;
}): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_variants')
    .select('id, product_id')
    .eq('id', input.id)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Variant not found.' };
  const { error } = await supabase
    .from('product_variants')
    .update({
      sku: input.sku?.trim() ?? undefined,
      size: input.size ?? null,
      color: input.color ?? null,
      material: input.material ?? null,
      metal: input.metal ?? null,
      gemstone: input.gemstone ?? null,
      ring_size: input.ring_size ?? null,
      chain_length_cm: input.chain_length_cm ?? null,
      low_stock_threshold: input.low_stock_threshold,
      price_override_cents: input.price_override_cents ?? null,
      compare_at_price_cents: input.compare_at_price_cents ?? null,
      weight_grams: input.weight_grams ?? null,
      is_active: input.is_active,
      position: input.position,
    })
    .eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'variant.update',
    entityType: 'variant',
    entityId: input.id,
    metadata: { productId: row.product_id, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${row.product_id}`);
  revalidatePath(`/admin/products/${row.product_id}/inventory`);
  return { ok: true };
}

export async function deleteVariantAction(input: { id: string }): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/products');
  const supabase = await createSupabaseServerClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_variants')
    .select('id, product_id, stock_quantity, reserved_quantity')
    .eq('id', input.id)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Variant not found.' };
  if (row.stock_quantity > 0 || row.reserved_quantity > 0) {
    return {
      ok: false,
      error: 'Zero out the stock for this variant through an inventory movement before removing it.',
    };
  }
  const { error } = await supabase.from('product_variants').delete().eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'variant.delete',
    entityType: 'variant',
    entityId: input.id,
    metadata: { productId: row.product_id, actor: session.user.id },
  });
  revalidatePath(`/admin/products/${row.product_id}`);
  revalidatePath(`/admin/products/${row.product_id}/inventory`);
  return { ok: true };
}
