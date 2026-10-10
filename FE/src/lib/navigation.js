import { ROLES } from './constants.js';

/**
 * Label tampilan peran (untuk sidebar, dll.)
 * Label desain berbeda dari nilai role internal.
 */
export const ROLE_LABEL = Object.freeze({
  [ROLES.PEMINJAM]: 'Peminjam',
  [ROLES.PENANGGUNG_JAWAB]: 'PJ Inventaris',
});

/**
 * Base path (prefix URL) per role.
 * Route group `(peminjam)` membungkus `peminjam/*` → URL `/peminjam/x`.
 * Route group `(pj)` membungkus `pj/*` → URL `/pj/x`.
 */
const BASE_PATH = Object.freeze({
  [ROLES.PEMINJAM]: '/peminjam',
  [ROLES.PENANGGUNG_JAWAB]: '/pj',
});

/**
 * Konfigurasi menu PEMINJAM (Mahasiswa).
 * Bentuk item: { key, label, href (relatif), icon (string nama), children? (sama struktur) }
 * Item "Pengajuan Saya" adalah induk tanpa halaman sendiri; anaknya yang aktif
 * menandai induk sebagai aktif di UI.
 */
const PEMINJAM_MENU = Object.freeze([
  {
    key: 'peminjam-dashboard',
    label: 'Dashboard',
    href: 'dashboard',
    icon: 'Home',
  },
  {
    key: 'peminjam-inventaris',
    label: 'Inventaris',
    href: 'inventaris',
    icon: 'Package',
  },
  {
    key: 'peminjam-pengajuan-saya',
    label: 'Pengajuan Saya',
    href: 'pengajuan-saya',
    icon: 'HandCoins',
    children: [
      {
        key: 'peminjam-pengajuan-saya-peminjaman',
        label: 'Peminjaman',
        href: 'pengajuan-saya/peminjaman',
      },
      {
        key: 'peminjam-pengajuan-saya-pengembalian',
        label: 'Pengembalian',
        href: 'pengajuan-saya/pengembalian',
      },
    ],
  },
  {
    key: 'peminjam-pengajuan-pj',
    label: 'Pengajuan PJ',
    href: 'pengajuan-pj',
    icon: 'UserRoundPlus',
  },
  {
    key: 'peminjam-tata-tertib',
    label: 'Tata Tertib',
    href: 'tata-tertib',
    icon: 'FileText',
  },
]);

/**
 * Konfigurasi menu PENANGGUNG JAWAB INVENTARIS (PJ).
 * TODO(desain): Menu Laporan belum ada di desain sidebar PJ; jangan ditambahkan.
 */
const PENANGGUNG_JAWAB_MENU = Object.freeze([
  {
    key: 'pj-dashboard',
    label: 'Dashboard',
    href: 'dashboard',
    icon: 'Home',
  },
  {
    key: 'pj-inventaris',
    label: 'Kelola Inventaris',
    href: 'inventaris',
    icon: 'Package',
  },
  {
    key: 'pj-peminjaman',
    label: 'Kelola Peminjaman',
    href: 'peminjaman',
    icon: 'HandCoins',
  },
  {
    key: 'pj-pengembalian',
    label: 'Kelola Pengembalian',
    href: 'pengembalian',
    icon: 'Undo2',
  },
  {
    key: 'pj-pengajuan-pj',
    label: 'List Pengajuan PJ',
    href: 'pengajuan-pj',
    icon: 'UserRoundPlus',
  },
  {
    key: 'pj-pengguna',
    label: 'Kelola Pengguna',
    href: 'pengguna',
    icon: 'UsersRound',
  },
]);

/**
 * Map role → menu (menu sudah dalam base path; gunakan getMenuForRole untuk
 * kembalikan href absolut).
 */
const MENU_BY_ROLE = Object.freeze({
  [ROLES.PEMINJAM]: PEMINJAM_MENU,
  [ROLES.PENANGGUNG_JAWAB]: PENANGGUNG_JAWAB_MENU,
});

/**
 * Gabung href base + relatif (hindari double-slash tanpa join library).
 * @param {string} base
 * @param {string} rel
 */
function joinHref(base, rel) {
  if (!rel) return base;
  return `${base}/${rel}`;
}

/**
 * Rekursif set href ke absolut berdasarkan base path.
 * @param {ReadonlyArray<object>} items
 * @param {string} base
 */
function withBase(items, base) {
  return items.map((it) => {
    const copy = { ...it, href: joinHref(base, it.href) };
    if (Array.isArray(it.children) && it.children.length) {
      copy.children = withBase(it.children, base);
      copy.firstChildHref = copy.children[0]?.href || copy.href;
    }
    return Object.freeze(copy);
  });
}

/**
 * Ambil konfigurasi menu untuk role tertentu.
 * Jika role tidak dikenali, kembalikan array kosong.
 * @param {string} role - value dari ROLES.*
 * @returns {ReadonlyArray<object>}
 */
export function getMenuForRole(role) {
  const base = BASE_PATH[role];
  const items = MENU_BY_ROLE[role];
  if (!base || !items) return Object.freeze([]);
  return Object.freeze(withBase(items, base));
}

/**
 * Cek apakah `pathname` aktif untuk `itemHref`.
 * - Cocok persis → aktif.
 * - Cocok prefix dengan batas `/` → aktif (mis. parent dari anak yang aktif).
 * - Tidak cocok sibling yang awalannya mirip (mis. `/inventaris` vs
 *   `/inventaris-lama`) karena batas `/`.
 *
 * @param {string} itemHref - href absolut (contoh: `/peminjam/pengajuan-saya`)
 * @param {string} pathname - `window.location.pathname` / `usePathname()`
 * @returns {boolean}
 */
export function isActivePath(itemHref, pathname) {
  if (typeof itemHref !== 'string' || typeof pathname !== 'string') return false;
  const a = itemHref.replace(/\/+$/, '');
  const b = pathname.replace(/\/+$/, '');
  if (!a) return a === b;
  if (a === b) return true;
  return b.startsWith(`${a}/`);
}

/**
 * Cari item aktif (atau anak aktif) dari menu untuk role, lalu kembalikan
 * label dan icon dari item yang aktif (anak lebih didahulukan daripada induk).
 * Dipakai untuk judul halaman di header konten dashboard.
 *
 * Jika tidak ada yang cocok, kembalikan string kosong dan icon `null`.
 *
 * @param {string} pathname
 * @param {string} role
 * @returns {{ title: string, icon: string|null }}
 */
export function getPageTitle(pathname, role) {
  const menu = getMenuForRole(role);
  for (const item of menu) {
    if (Array.isArray(item.children) && item.children.length) {
      for (const child of item.children) {
        if (isActivePath(child.href, pathname)) {
          return { title: child.label, icon: item.icon || null };
        }
      }
    }
    if (isActivePath(item.href, pathname)) {
      return { title: item.label, icon: item.icon || null };
    }
  }
  return { title: '', icon: null };
}

/**
 * Ambil inisial dari nama: maksimum 2 huruf (huruf pertama kata pertama dan
 * kata terakhir jika ada lebih dari satu kata), huruf kapital.
 * Menangani spasi ganda, satu kata, dan string kosong.
 *
 * Contoh:
 *   "Maitri Sakti" → "MS"
 *   "Budi"        → "BU"
 *   "  dua   spasi  " → "DS"
 *   ""            → ""
 *
 * @param {string} nama
 * @returns {string}
 */
export function getInitials(nama) {
  if (typeof nama !== 'string') return '';
  const words = nama.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    // Satu kata: ambil 1-2 huruf pertama (huruf kapital).
    const first = words[0];
    if (first.length < 2) return first.toUpperCase();
    return first.slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Kembalikan base path untuk role.
 * @param {string} role
 */
export function getBasePath(role) {
  return BASE_PATH[role] || '';
}
