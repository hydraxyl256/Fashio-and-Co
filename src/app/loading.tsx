import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container-prose py-24" aria-busy="true" aria-live="polite">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-6 h-16 w-3/4" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
