'use client';

import { Send, CircleCheck, TriangleAlert } from 'lucide-react';
import ConfirmDialog from '@/components/Common/ConfirmDialog.jsx';

/**
 * Tiga dialog konfirmasi untuk alur pengajuan peminjaman:
 * 1. Konfirmasi Kirim ("Kirim Pengajuan?")
 * 2. Notifikasi Sukses ("Pengajuan Berhasil Dikirim!")
 * 3. Konfirmasi Batal ("Batal Mengajukan")
 */
export default function AjukanDialogs({
  openKirim,
  onOpenKirimChange,
  onConfirmKirim,
  isSubmitting,
  openSukses,
  onOpenSuksesChange,
  onKembaliSukses,
  openBatal,
  onOpenBatalChange,
  onConfirmBatal,
}) {
  return (
    <>
      {/* 1. Dialog Konfirmasi Kirim */}
      <ConfirmDialog
        open={openKirim}
        onOpenChange={onOpenKirimChange}
        title="Kirim Pengajuan?"
        description="Periksa kembali data pengajuan yang akan anda kirim"
        confirmText="Kirim"
        cancelText="Kembali"
        onConfirm={onConfirmKirim}
        isLoading={isSubmitting}
        confirmVariant="default"
        // TODO(desain): Desain asli menampilkan ilustrasi pesawat kertas biru; saat ini memakai ikon Send
        icon={<Send className="size-7" aria-hidden="true" />}
        iconContainerClassName="bg-primary/10 text-primary"
      />

      {/* 2. Dialog Sukses Kirim */}
      <ConfirmDialog
        open={openSukses}
        onOpenChange={onOpenSuksesChange}
        title="Pengajuan Berhasil Dikirim!"
        description="Anda telah berhasil mengirimkan pengajuan peminjaman"
        confirmText="Kembali"
        cancelText={null}
        onConfirm={onKembaliSukses}
        confirmVariant="default"
        // TODO(desain): Tujuan tombol 'Kembali' saat ini mengarah ke katalog /peminjam/inventaris.
        // Halaman Pengajuan Saya baru akan diimplementasikan pada Task 6.
        icon={<CircleCheck className="size-7" aria-hidden="true" />}
        iconContainerClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />

      {/* 3. Dialog Konfirmasi Batal */}
      <ConfirmDialog
        open={openBatal}
        onOpenChange={onOpenBatalChange}
        title="Batal Mengajukan"
        description="Apakah anda yakin ingin membatalkan pengajuan?"
        confirmText="Batalkan"
        cancelText="Kembali"
        onConfirm={onConfirmBatal}
        confirmVariant="default"
        // TODO(desain): Desain asli menampilkan ilustrasi lingkaran merah dengan tanda seru; saat ini memakai ikon TriangleAlert
        icon={<TriangleAlert className="size-7" aria-hidden="true" />}
        iconContainerClassName="bg-destructive/10 text-destructive"
      />
    </>
  );
}
