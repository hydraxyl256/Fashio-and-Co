'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserRoleAction } from '@/lib/admin/actions/users';
import type { UserRole } from '@/types/database';

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  selfId: string;
}

const ROLES: UserRole[] = ['customer', 'staff', 'admin'];

export function UserRoleSelect({ userId, currentRole, selfId }: UserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<UserRole>(currentRole);
  const [busy, setBusy] = React.useState(false);
  const isSelf = userId === selfId;

  async function onChange(next: string) {
    const newRole = next as UserRole;
    if (newRole === role) return;
    setBusy(true);
    const result = await updateUserRoleAction({ userId, role: newRole });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the role.');
      return;
    }
    setRole(newRole);
    toast.success('Role updated.');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={onChange} disabled={busy}>
        <SelectTrigger className="w-32 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      {isSelf ? (
        <span className="text-xs text-muted-foreground">You</span>
      ) : null}
    </div>
  );
}
