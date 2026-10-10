'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

// TODO(desain): Ilustrasi asli (pesawat kertas biru, lingkaran merah) belum tersedia sebagai aset grafis statis;
// saat ini menggunakan ikon lucide-react di dalam kontainer lingkaran semantik token CSS.

/**
 * Komponen dialog konfirmasi generik yang dapat dipakai ulang (Task 5b, 6, 7).
 *
 * @param {object} props
 * @param {boolean} props.open Status terbuka/tertutupnya modal dialog
 * @param {(open: boolean) => void} props.onOpenChange Handler saat status modal berubah
 * @param {React.ReactNode} [props.icon] Elemen ikon yang ditampilkan di atas judul
 * @param {string} [props.iconContainerClassName] Kelas styling wadah lingkaran ikon
 * @param {string} props.title Judul modal dialog
 * @param {string} [props.description] Deskripsi penjelas di bawah judul
 * @param {string} [props.confirmText='Konfirmasi'] Label teks tombol utama
 * @param {string|null} [props.cancelText='Kembali'] Label teks tombol batal (null bila hanya 1 tombol)
 * @param {() => void} [props.onConfirm] Handler saat tombol konfirmasi ditekan
 * @param {() => void} [props.onCancel] Handler saat tombol batal ditekan
 * @param {boolean} [props.isLoading=false] Status loading saat aksi sedang diproses (mencegah kirim ganda)
 * @param {string} [props.confirmVariant='default'] Varian tombol konfirmasi ('default', 'destructive', dst.)
 * @param {string} [props.confirmClassName] Kelas tambahan tombol konfirmasi
 * @param {string} [props.cancelClassName] Kelas tambahan tombol batal
 * @param {boolean} [props.preventClose=false] Paksa cegah penutupan via escape / klik luar
 * @param {React.ReactNode} [props.children] Konten kustom tambahan di dalam dialog
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  icon,
  iconContainerClassName,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Kembali',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmVariant = 'default',
  confirmClassName,
  cancelClassName,
  preventClose = false,
  children,
}) {
  const cancelBtnRef = React.useRef(null);
  const confirmBtnRef = React.useRef(null);

  const shouldBlockClose = isLoading || preventClose;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && shouldBlockClose) {
      return;
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen && onCancel) {
      onCancel();
    }
  };

  const handleCancelClick = () => {
    if (shouldBlockClose) return;
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirmClick = () => {
    if (shouldBlockClose) return;
    onConfirm?.();
  };

  const hasCancelButton = Boolean(cancelText);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          if (shouldBlockClose) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (shouldBlockClose) e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          // Aksesibilitas: arahkan fokus awal ke tombol aman (bukan tombol destruktif/kirim)
          if (hasCancelButton && cancelBtnRef.current) {
            e.preventDefault();
            cancelBtnRef.current.focus();
          } else if (confirmBtnRef.current) {
            e.preventDefault();
            confirmBtnRef.current.focus();
          }
        }}
        className="max-w-md p-6 sm:p-8 rounded-2xl text-center"
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-0">
          {icon && (
            <div
              className={cn(
                'mx-auto mb-4 flex size-16 items-center justify-center rounded-full transition-transform',
                iconContainerClassName || 'bg-primary/10 text-primary'
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground text-center">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="mt-2 text-sm text-muted-foreground text-center max-w-sm mx-auto">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="mt-4">{children}</div>}

        <div
          className={cn(
            'mt-6 flex w-full gap-3',
            hasCancelButton ? 'flex-col-reverse sm:flex-row' : 'flex-col'
          )}
        >
          {hasCancelButton && (
            <Button
              ref={cancelBtnRef}
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleCancelClick}
              className={cn(
                'h-11 flex-1 rounded-xl border-border font-medium hover:bg-muted text-foreground transition-colors',
                cancelClassName
              )}
            >
              {cancelText}
            </Button>
          )}

          <Button
            ref={confirmBtnRef}
            type="button"
            variant={confirmVariant}
            disabled={isLoading}
            onClick={handleConfirmClick}
            className={cn(
              'h-11 flex-1 rounded-xl font-medium shadow-sm transition-colors',
              confirmVariant === 'default' &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
              confirmClassName
            )}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Memproses...</span>
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
