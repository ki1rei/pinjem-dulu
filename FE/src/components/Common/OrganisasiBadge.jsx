import { cn } from '@/lib/utils.js';
import { getInitials } from '@/lib/navigation.js';

/**
 * Badge organisasi / OKI: lingkaran berwarna dengan inisial + nama organisasi.
 * Jika icon tersedia nanti bisa menggantikan inisial. Saat ini fallback ke
 * inisial dari nama (fungsi getInitials dari navigation.js).
 */
const OrganisasiBadge = ({ nama, size = 'sm', className = '' }) => {
  if (!nama) return null;
  const initials = getInitials(nama);
  const dotSize =
    size === 'lg'
      ? 'h-8 w-8 text-xs'
      : size === 'md'
        ? 'h-7 w-7 text-[11px]'
        : 'h-6 w-6 text-[10px]';
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-sm' : 'text-xs';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white font-semibold',
          dotSize
        )}
        aria-hidden="true"
      >
        {initials.slice(0, 2)}
      </span>
      <span className={cn('truncate', textSize)}>{nama}</span>
    </span>
  );
};

export default OrganisasiBadge;
