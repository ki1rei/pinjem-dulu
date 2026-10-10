import { Badge } from '@/components/ui/badge.jsx';

/**
 * Badge kategori inventaris (varian info sesuai desain).
 * Bila nama kosong / null — kembalikan null agar tidak tampil.
 */
const KategoriBadge = ({ nama }) => {
  if (!nama) return null;
  return (
    <Badge variant="info" className="font-normal">
      {nama}
    </Badge>
  );
};

export default KategoriBadge;
