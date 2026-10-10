import {
  BADGE_VARIANT_DEFAULT,
  STATUS_PEMINJAMAN_VARIANT,
  STATUS_REQUEST_PJ_VARIANT,
  getStatusLabel,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge.jsx';

function resolveVariant(status) {
  if (STATUS_PEMINJAMAN_VARIANT[status]) return STATUS_PEMINJAMAN_VARIANT[status];
  if (STATUS_REQUEST_PJ_VARIANT[status]) return STATUS_REQUEST_PJ_VARIANT[status];
  return BADGE_VARIANT_DEFAULT;
}

/**
 * Badge status peminjaman / request-pj.
 *
 * @param {{
 *   status: string,
 *   konteks?: 'peminjaman'|'pengembalian',
 *   className?: string,
 * }} props
 */
const StatusBadge = ({ status, konteks, className, ...props }) => {
  const label = getStatusLabel(status, konteks);
  return (
    <Badge variant={resolveVariant(status)} className={cn('break-words', className)} {...props}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
