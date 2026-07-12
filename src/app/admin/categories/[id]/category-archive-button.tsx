'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ArchiveRestore } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  archiveCategoryAction,
  restoreCategoryAction,
} from '@/lib/admin/actions/tree';

interface CategoryArchiveButtonProps {
  categoryId: string;
  isActive: boolean;
}

export function CategoryArchiveButton({ categoryId, isActive }: CategoryArchiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onConfirm() {
    setBusy(true);
    const result = isActive
      ? await archiveCategoryAction(categoryId)
      : await restoreCategoryAction(categoryId);
    setBusy(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the category.');
      return;
    }
    toast.success(isActive ? 'Category archived.' : 'Category restored.');
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
        {isActive ? (
          <>
            <Archive className="h-4 w-4" /> Archive category
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4" /> Restore category
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Archive this category?' : 'Restore this category?'}
        description={
          isActive
            ? 'The category will disappear from storefront navigation. Products remain attached.'
            : 'The category will reappear in storefront navigation.'
        }
        confirmLabel={isActive ? 'Archive' : 'Restore'}
        destructive={isActive}
        loading={busy}
        onConfirm={onConfirm}
      />
    </>
  );
}
