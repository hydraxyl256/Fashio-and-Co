'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ArchiveRestore } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  archiveProductAction,
  restoreProductAction,
} from '@/lib/admin/actions/products';

interface ProductArchiveButtonProps {
  productId: string;
  isActive: boolean;
}

export function ProductArchiveButton({ productId, isActive }: ProductArchiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onConfirm() {
    setBusy(true);
    const result = isActive
      ? await archiveProductAction(productId)
      : await restoreProductAction(productId);
    setBusy(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the product.');
      return;
    }
    toast.success(isActive ? 'Product archived.' : 'Product restored.');
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => setOpen(true)}
      >
        {isActive ? (
          <>
            <Archive className="h-4 w-4" /> Archive product
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4" /> Restore product
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Archive this product?' : 'Restore this product?'}
        description={
          isActive
            ? 'The product will be hidden from the storefront and search, but order history is preserved.'
            : 'The product will be visible on the storefront again and available to customers.'
        }
        confirmLabel={isActive ? 'Archive' : 'Restore'}
        destructive={isActive}
        loading={busy}
        onConfirm={onConfirm}
      />
    </>
  );
}
