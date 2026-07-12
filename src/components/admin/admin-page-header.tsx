import * as React from 'react';

import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Editorial page header for admin modules. Mirrors the storefront tone
 * (eyebrow + serif title + small description) and slots a row of actions
 * to the right on wide viewports.
 */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-2xl leading-tight tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
