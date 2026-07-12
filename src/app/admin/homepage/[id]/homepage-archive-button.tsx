'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { archiveHomepageSectionAction } from '@/lib/admin/actions/homepage';

export function HomepageArchiveButton({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onConfirm() {
    setBusy(true);
    const result = await archiveHomepageSectionAction(sectionId);
    setBusy(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not archive the section.');
      return;
    }
    toast.success('Section archived.');
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
        <Archive className="h-4 w-4" /> Archive section
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Archive this section?"
        description="The section will be hidden from the storefront. You can re-create it from scratch."
        confirmLabel="Archive"
        destructive
        loading={busy}
        onConfirm={onConfirm}
      />
    </>
  );
}
