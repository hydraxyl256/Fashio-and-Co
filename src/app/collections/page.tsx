import type { Metadata } from 'next';

import { CollectionFeature } from '@/components/storefront/collection-feature';
import { publicImageUrl, listActiveCollections } from '@/lib/queries/catalogue';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Seasonal edits from the Fashion & Co. atelier.',
};

export const revalidate = 600;

/** Local shape — avoids 'never' when Supabase types lag behind the schema */
type CollectionListRow = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  hero_image_url: string | null;
};

export default async function CollectionsIndex() {
  const raw = await listActiveCollections();
  const collections = (raw ?? []) as unknown as CollectionListRow[];
  return (
    <div>
      <section className="container-prose pt-20 pb-12 lg:pt-28">
        <p className="eyebrow">Collections</p>
        <h1 className="mt-3 font-serif text-display-xl tracking-tight text-balance max-w-3xl">
          Seasonal edits, made slowly.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Each collection is produced in small runs and signed in our Nairobi workshop. Browse the
          current edit, or revisit an archive.
        </p>
      </section>

      <CollectionFeature
        collections={collections.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          subtitle: c.subtitle ?? null,
          description: c.description ?? null,
          heroImagePath: c.hero_image_url ?? null,
        }))}
      />
    </div>
  );
}
