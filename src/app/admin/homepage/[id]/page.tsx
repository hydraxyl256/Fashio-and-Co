import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { requireStaffOrAdmin } from '@/lib/auth/session';
import { getAdminHomepageSection } from '@/lib/admin/queries/homepage';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/admin/status-badge';
import { HomepageForm } from '../homepage-form';
import {
  updateHomepageSectionAction,
  archiveHomepageSectionAction,
} from '@/lib/admin/actions/homepage';
import { HomepageArchiveButton } from './homepage-archive-button';
import { uploadHomepageImageAction } from '@/lib/admin/actions/homepage';

export const metadata = { title: 'Admin · Edit homepage section' };
export const dynamic = 'force-dynamic';

export default async function AdminEditHomepagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrAdmin('/admin/homepage');
  const { id } = await params;
  const section = await getAdminHomepageSection(id);
  if (!section) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/homepage"
          className="inline-flex items-center gap-1 text-eyebrow uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All sections
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,18rem]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-muted-foreground">
              {section.is_active ? 'Active' : 'Archived'} · {section.kind}
            </p>
            <h1 className="mt-1 font-display text-3xl">{section.title ?? section.slug}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{section.slug}</span> · order {section.display_order}
            </p>
          </div>
          <HomepageForm
            sectionId={section.id}
            initialValues={{
              kind: section.kind,
              slug: section.slug,
              title: section.title,
              subtitle: section.subtitle,
              body: section.body,
              imageUrl: section.image_url,
              ctaLabel: section.cta_label,
              ctaHref: section.cta_href,
              displayOrder: section.display_order,
              isActive: section.is_active,
              startsAt: section.starts_at,
              endsAt: section.ends_at,
            }}
            saveAction={async (input) => {
              if (!input.id) return { ok: false, error: 'Missing section id.' };
              const res = await updateHomepageSectionAction({ ...input, id: input.id });
              return res.ok
                ? { ok: true as const, data: { id: input.id } }
                : { ok: false as const, error: res.error };
            }}
            uploadAction={uploadHomepageImageAction}
          />
        </div>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Schedule</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge variant={section.is_active ? 'active' : 'archived'}>
                    {section.is_active ? 'active' : 'archived'}
                  </StatusBadge>
                </dd>
              </div>
              {section.starts_at ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Starts</dt>
                  <dd className="font-medium">
                    {formatDate(section.starts_at, { dateStyle: 'medium' })}
                  </dd>
                </div>
              ) : null}
              {section.ends_at ? (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Ends</dt>
                  <dd className="font-medium">
                    {formatDate(section.ends_at, { dateStyle: 'medium' })}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="border border-border bg-card p-4">
            <p className="eyebrow text-muted-foreground">Danger zone</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Archiving hides the section from the storefront.
            </p>
            <HomepageArchiveButton sectionId={section.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
