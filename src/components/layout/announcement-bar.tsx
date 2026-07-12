import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  message?: string;
  className?: string;
}

/**
 * Top announcement strip — Stitch design spec.
 * Background: s-primary (#430562), text: white, Montserrat label-sm.
 */
export function AnnouncementBar({
  message = 'Complimentary Nairobi Delivery on orders above KES 10,000',
  className,
}: AnnouncementBarProps) {
  return (
    <div
      role="region"
      aria-label="Site announcements"
      className={cn(
        'bg-[#430562] text-white',
        'font-montserrat text-[12px] font-medium leading-[16px] tracking-[0.2em] uppercase',
        'flex items-center justify-center px-4 py-2 text-center',
        className,
      )}
    >
      <span>{message}</span>
    </div>
  );
}
