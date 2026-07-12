'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ArchiveRestore } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  archiveDiscountAction,
  reactivateDiscountAction,
} from '@/lib/admin/actions/discounts';

interface DiscountArchiveButtonProps {
  discountId: string;
  isActive: boolean;
}

export function DiscountArchiveButton({ discountId, isActive }: DiscountArchiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onConfirm() {
    setBusy(true);
    const result = isActive
      ? await archiveDiscountAction(discountId)
      : await reactivateDiscountAction(discountId);
    setBusy(false);
    setOpen(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the discount.');
      return;
    }
    toast.success(isActive ? 'Discount archived.' : 'Discount reactivated.');
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
        {isActive ? (
          <>
            <Archive className="h-4 w-4" /> Archive
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4" /> Reactivate
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? 'Archive this discount?' : 'Reactivate this discount?'}
        description={
          isActive
            ? 'Customers will no longer be able to apply this code. Existing redemptions are kept.'
            : 'The code will be re-enabled for customers at checkout.'
        }
        confirmLabel={isActive ? 'Archive' : 'Reactivate'}
        destructive={isActive}
        loading={busy}
        onConfirm={onConfirm}
      />
    </>
  );
}
