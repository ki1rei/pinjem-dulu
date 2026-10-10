import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils.js';

/**
 * Tampil gambar barang dengan fallback blok + ikon ketika `src` kosong
 * atau gagal dimuat. Menggunakan native <img> agar aset lokal di public/
 * (path "/inventaris/xxx.svg") dapat ditampilkan tanpa konfigurasi domain
 * gambar luar dan tanpa provider next/image remote pattern.
 *
 * Prop `alt` wajib (aksesibel).
 */
const ImageWithFallback = ({ src, alt, className, aspect = 'aspect-[4/3]' }) => {
  const [errored, setErrored] = useState(false);
  const punyaSrc = !!src && typeof src === 'string' && src.length > 0 && !errored;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900',
        aspect,
        className
      )}
    >
      {punyaSrc ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Package size={36} strokeWidth={1.6} aria-hidden="true" />
          <span className="text-xs font-medium">{alt || 'Tanpa gambar'}</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
