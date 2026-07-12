import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * Editorial empty state. Used by the cart, order history, search results,
 * and any future list-based view. Pairs well with a single call to action.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-4 border border-dashed border-border bg-muted/30 px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="text-muted-foreground" aria-hidden>
          {icon}
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="font-serif text-2xl tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
