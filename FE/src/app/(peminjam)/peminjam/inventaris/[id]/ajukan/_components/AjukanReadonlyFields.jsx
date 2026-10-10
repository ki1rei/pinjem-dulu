'use client';

import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

/**
 * Field-field hanya-baca pada form pengajuan peminjaman barang inventaris.
 *
 * @param {object} props
 * @param {object|null} props.user Data akun peminjam yang sedang login
 * @param {object|null} props.inventaris Data detail barang inventaris yang dipinjam
 */
export default function AjukanReadonlyFields({ user, inventaris }) {
  const namaLengkap = user?.nama || '-';
  const nim = user?.nim || '-';
  const okiPeminjam = user?.organisasi?.namaOrganisasi || user?.namaOrganisasi || '-';
  const barangDipinjam = inventaris?.namaBarang || '-';

  return (
    <div className="space-y-4">
      {/* Nama Lengkap */}
      <div className="space-y-1.5">
        <Label htmlFor="field-nama" className="text-sm font-medium text-foreground">
          Nama Lengkap
        </Label>
        <Input
          id="field-nama"
          type="text"
          readOnly
          tabIndex={-1}
          value={namaLengkap}
          className="bg-muted/50 text-foreground cursor-not-allowed select-all border-input font-normal"
        />
      </div>

      {/* NIM */}
      <div className="space-y-1.5">
        <Label htmlFor="field-nim" className="text-sm font-medium text-foreground">
          NIM
        </Label>
        <Input
          id="field-nim"
          type="text"
          readOnly
          tabIndex={-1}
          value={nim}
          className="bg-muted/50 text-foreground cursor-not-allowed select-all border-input font-normal"
        />
      </div>

      {/* OKI Peminjam */}
      <div className="space-y-1.5">
        <Label htmlFor="field-oki" className="text-sm font-medium text-foreground">
          OKI Peminjam
        </Label>
        <Input
          id="field-oki"
          type="text"
          readOnly
          tabIndex={-1}
          value={okiPeminjam}
          className="bg-muted/50 text-foreground cursor-not-allowed select-all border-input font-normal"
        />
      </div>

      {/* Barang Dipinjam */}
      <div className="space-y-1.5">
        <Label htmlFor="field-barang" className="text-sm font-medium text-foreground">
          Barang Dipinjam
        </Label>
        <Input
          id="field-barang"
          type="text"
          readOnly
          tabIndex={-1}
          value={barangDipinjam}
          className="bg-muted/50 text-foreground cursor-not-allowed select-all border-input font-normal"
        />
      </div>
    </div>
  );
}
