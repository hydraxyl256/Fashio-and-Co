import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted/60',
        'after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-shimmer',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
