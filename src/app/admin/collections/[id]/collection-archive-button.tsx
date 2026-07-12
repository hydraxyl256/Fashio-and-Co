'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ArchiveRestore } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  archiveCollectionAction,
  restoreCollectionAction,
} from '@/lib/admin/actions/tree';

interface CollectionArchiveButtonProps {
  collectionId: string;
  isActive: boolean;
}

export function CollectionArchiveButton({ collectionId, isActive }: CollectionArchiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onConfirm() {
    setBusy(true);
    const result = isActive
      ? await archiveCollectionAction(collectionId)
      : await restoreCollectionAction(collectionId);
    setBusy(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the collection.');
      return;
    }
    toast.success(isActive ? 'Collection archived.' : 'Collection restored.');
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
        {isActive ? (
          <>
            <Archive className="h-4 w-4" /> Archive collection
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4" /> Restore collection
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Archive this collection?' : 'Restore this collection?'}
        description={
          isActive
            ? 'The collection will disappear from the storefront.'
            : 'The collection will be visible on the storefront again.'
        }
        confirmLabel={isActive ? 'Archive' : 'Restore'}
        destructive={isActive}
        loading={busy}
        onConfirm={onConfirm}
      />
    </>
  );
}
