import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Package2 } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getProductForEdit } from '@/lib/admin/queries/products';
import { publicImageUrl } from '@/lib/admin/storage';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { ProductForm } from '../product-form';
import { ProductArchiveButton } from './product-archive-button';
import {
  checkSlugAvailabilityAction,
  deleteProductImageAction,
  reorderProductImagesAction,
  setProductImageCoverAction,
  updateProductAction,
  updateProductImageAltAction,
  uploadProductImageAction,
} from '@/lib/admin/actions/products';
import { VariantFormValue } from '@/components/admin';
import type { AdminGalleryImage } from '@/components/admin/image-gallery-manager';

export const metadata = { title: 'Admin · Edit product' };
export const dynamic = 'force-dynamic';

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/products');
  const { id } = await params;
  const data = await getProductForEdit(id);
  if (!data.product) notFound();

  const product = data.product;
  const variants: VariantFormValue[] = data.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    material: v.material,
    metal: v.metal,
    gemstone: v.gemstone,
    ring_size: v.ring_size,
    chain_length_cm: v.chain_length_cm,
    stock_quantity: v.stock_quantity,
    reserved_quantity: v.reserved_quantity,
    low_stock_threshold: v.low_stock_threshold,
    price_override_cents: v.price_override_cents,
    compare_at_price_cents: v.compare_at_price_cents,
    weight_grams: v.weight_grams,
    is_active: v.is_active,
    position: v.position,
  }));

  const images: AdminGalleryImage[] = data.images.map((img) => ({
    id: img.id,
    storagePath: img.storage_path,
    altText: img.alt_text,
    isCover: img.is_cover,
    displayOrder: img.display_order,
  }));

  const totalStock = variants.reduce(
    (acc, v) => acc + Math.max(0, v.stock_quantity - v.reserved_quantity),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All products
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,18rem]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-muted-foreground">{product.is_active ? 'Active' : 'Archived'}</p>
            <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{product.slug}</span> ·{' '}
              {formatCurrency(product.price_cents, { currency: product.currency })} · last updated{' '}
              {formatDate(product.updated_at, { dateStyle: 'medium' })}
            </p>
          </div>
          <ProductForm
            productId={product.id}
            initialValues={{
              name: product.name,
              slug: product.slug,
              shortDescription: product.short_description,
              fullDescription: product.full_description,
              categoryId: product.category_id,
              priceCents: product.price_cents,
              compareAtPriceCents: product.compare_at_price_cents,
              currency: product.currency,
              careInstructions: product.care_instructions,
              fitNotes: product.fit_notes,
              metaTitle: product.meta_title,
              metaDescription: product.meta_description,
              isFeatured: product.is_featured,
              isActive: product.is_active,
              publishedAt: product.published_at,
            }}
            categories={data.categories}
            variants={variants}
            images={images}
            saveAction={async (input) => {
              if (!input.id) return { ok: false, error: 'Missing product id.' };
              const res = await updateProductAction({ ...input, id: input.id });
              if (!res.ok) return res;
              return { ok: true as const, data: { id: input.id, slug: res.data?.slug ?? '' } };
            }}
            uploadImageAction={uploadProductImageAction}
            deleteImageAction={deleteProductImageAction}
            reorderImagesAction={reorderProductImagesAction}
            setCoverAction={setProductImageCoverAction}
            updateAltAction={updateProductImageAltAction}
            checkSlugAction={checkSlugAvailabilityAction}
          />
        </div>

        <aside className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">At a glance</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Variants</dt>
                <dd className="font-medium">{formatNumber(variants.length)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Available stock</dt>
                <dd className="font-medium">{formatNumber(totalStock)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Images</dt>
                <dd className="font-medium">{formatNumber(images.length)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Featured</dt>
                <dd className="font-medium">{product.is_featured ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Published</dt>
                <dd className="font-medium">
                  {product.published_at
                    ? formatDate(product.published_at, { dateStyle: 'medium' })
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Quick links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/products/${product.id}/inventory`}>
                  <Package2 className="h-4 w-4" /> Adjust stock
                </Link>
              </Button>
              {product.is_active ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> View on storefront
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Danger zone</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Archiving hides the product from the storefront but keeps all history intact.
            </p>
            <ProductArchiveButton
              productId={product.id}
              isActive={product.is_active}
            />
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicImageUrl(images[0].storagePath)}
                alt=""
                className="mt-3 h-32 w-full object-cover"
              />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
