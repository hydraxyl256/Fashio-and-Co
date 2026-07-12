'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logAudit, slugify } from '@/lib/admin';
import { isHomepageSlugTaken } from '@/lib/admin/queries/homepage';
import { StorageValidationError, uploadImage, deleteImage, validateImage } from '@/lib/admin/storage';

export type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const sectionSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(['hero', 'category_grid', 'collection_feature', 'editorial', 'product_grid']),
  slug: z.string().min(1).max(120),
  title: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(300).optional().nullable(),
  body: z.string().max(4000).optional().nullable(),
  image_url: z.string().url().max(800).optional().nullable(),
  cta_label: z.string().max(60).optional().nullable(),
  cta_href: z.string().max(800).optional().nullable(),
  display_order: z.coerce.number().int().min(0).max(1000).default(0),
  is_active: z.coerce.boolean().default(true),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
});

function normalize(input: z.infer<typeof sectionSchema>) {
  return {
    kind: input.kind,
    slug: input.slug,
    title: input.title ?? null,
    subtitle: input.subtitle ?? null,
    body: input.body ?? null,
    image_url: input.image_url ?? null,
    cta_label: input.cta_label ?? null,
    cta_href: input.cta_href ?? null,
    display_order: input.display_order,
    is_active: input.is_active,
    starts_at: input.starts_at ?? null,
    ends_at: input.ends_at ?? null,
  };
}

export async function createHomepageSectionAction(
  input: z.input<typeof sectionSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireStaffOrAdmin('/admin/homepage');
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid section.' };
  }
  const slug = slugify(parsed.data.slug);
  if (await isHomepageSlugTaken(slug)) {
    return { ok: false, error: 'A section with that slug already exists.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('homepage_sections')
    .insert({ ...normalize(parsed.data), slug })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not create the section.' };
  await logAudit({
    action: 'homepage.create',
    entityType: 'homepage_section',
    entityId: data.id,
    metadata: { kind: parsed.data.kind, slug, actor: session.user.id },
  });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
  return { ok: true, data: { id: data.id } };
}

export async function updateHomepageSectionAction(
  input: z.input<typeof sectionSchema> & { id: string },
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/homepage');
  if (!input.id) return { ok: false, error: 'Missing section id.' };
  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid section.' };
  }
  const slug = slugify(parsed.data.slug);
  if (await isHomepageSlugTaken(slug, input.id)) {
    return { ok: false, error: 'A different section already uses that slug.' };
  }
  if (parsed.data.starts_at && parsed.data.ends_at && new Date(parsed.data.ends_at) <= new Date(parsed.data.starts_at)) {
    return { ok: false, error: 'The end date must be after the start date.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('homepage_sections')
    .update({ ...normalize(parsed.data), slug })
    .eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'homepage.update',
    entityType: 'homepage_section',
    entityId: input.id,
    metadata: { kind: parsed.data.kind, slug, actor: session.user.id },
  });
  revalidatePath('/admin/homepage');
  revalidatePath(`/admin/homepage/${input.id}`);
  revalidatePath('/');
  return { ok: true };
}

export async function archiveHomepageSectionAction(id: string): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/homepage');
  if (!id) return { ok: false, error: 'Missing section id.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('homepage_sections')
    .update({ is_active: false })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    action: 'homepage.archive',
    entityType: 'homepage_section',
    entityId: id,
    metadata: { actor: session.user.id },
  });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
  return { ok: true };
}

export async function reorderHomepageSectionsAction(
  orderedIds: string[],
): Promise<ActionResult> {
  const session = await requireStaffOrAdmin('/admin/homepage');
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: 'Provide a list of section ids in display order.' };
  }
  const supabase = await createSupabaseServerClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('homepage_sections')
        .update({ display_order: index })
        .eq('id', id),
    ),
  );
  await logAudit({
    action: 'homepage.reorder',
    entityType: 'homepage_section',
    metadata: { count: orderedIds.length, actor: session.user.id },
  });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
  return { ok: true };
}

export async function uploadHomepageImageAction(input: {
  sectionId: string;
  bytesBase64: string;
  contentType: string;
  originalName: string;
}): Promise<ActionResult<{ imageUrl: string; storagePath: string }>> {
  const session = await requireStaffOrAdmin('/admin/homepage');
  if (!input.sectionId) return { ok: false, error: 'Missing section id.' };
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
  const supabase = await createSupabaseServerClient();
  const { data: section, error: fetchErr } = await supabase
    .from('homepage_sections')
    .select('id, image_url')
    .eq('id', input.sectionId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!section) return { ok: false, error: 'Section not found.' };

  let uploaded: Awaited<ReturnType<typeof uploadImage>>;
  try {
    uploaded = await uploadImage({
      productId: `homepage/${input.sectionId}`,
      bytes,
      contentType: input.contentType,
      originalName: input.originalName,
      bucket: 'campaign-images',
    });
  } catch (err) {
    if (err instanceof StorageValidationError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const imageUrl = `${base}/storage/v1/object/public/${uploaded.bucket}/${uploaded.storagePath.split('/').map(encodeURIComponent).join('/')}`;

  const { error } = await supabase
    .from('homepage_sections')
    .update({ image_url: imageUrl })
    .eq('id', input.sectionId);
  if (error) {
    await deleteImage(uploaded.storagePath, 'campaign-images').catch(() => undefined);
    return { ok: false, error: error.message };
  }
  // Best-effort cleanup of the old image (if it lived in our bucket).
  if (section.image_url && section.image_url.includes('/storage/v1/object/public/campaign-images/')) {
    const tail = section.image_url.split('/storage/v1/object/public/campaign-images/')[1];
    if (tail) {
      const oldPath = decodeURIComponent(tail);
      await deleteImage(oldPath, 'campaign-images').catch(() => undefined);
    }
  }
  await logAudit({
    action: 'homepage.image.upload',
    entityType: 'homepage_section',
    entityId: input.sectionId,
    metadata: { storagePath: uploaded.storagePath, actor: session.user.id },
  });
  revalidatePath('/admin/homepage');
  revalidatePath(`/admin/homepage/${input.sectionId}`);
  revalidatePath('/');
  return { ok: true, data: { imageUrl, storagePath: uploaded.storagePath } };
}
