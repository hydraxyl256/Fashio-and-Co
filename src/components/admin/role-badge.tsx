import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/database';

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'border-rose-500/40 text-rose-700 bg-rose-50',
  staff: 'border-indigo-500/40 text-indigo-700 bg-indigo-50',
  customer: 'border-zinc-500/40 text-zinc-700 bg-zinc-50',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge
      variant="outline"
      className={`uppercase tracking-wide ${ROLE_STYLES[role] ?? ''}`}
    >
      {role}
    </Badge>
  );
}
