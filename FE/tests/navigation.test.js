import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getMenuForRole,
  isActivePath,
  getPageTitle,
  getInitials,
  ROLE_LABEL,
} from '../src/lib/navigation.js';
import { ROLES } from '../src/lib/constants.js';

/* ========================================================================== */
/*                         ROLE_LABEL & getMenuForRole                        */
/* ========================================================================== */

test('ROLE_LABEL: label sesuai peran (Peminjam / PJ Inventaris)', () => {
  assert.equal(ROLE_LABEL[ROLES.PEMINJAM], 'Peminjam');
  assert.equal(ROLE_LABEL[ROLES.PENANGGUNG_JAWAB], 'PJ Inventaris');
});

test('menu peminjam: isi dan urutan sesuai desain (5 item, Pengajuan Saya punya 2 anak)', () => {
  const menu = getMenuForRole(ROLES.PEMINJAM);
  assert.equal(menu.length, 5);

  assert.equal(menu[0].label, 'Dashboard');
  assert.equal(menu[0].href, '/peminjam/dashboard');
  assert.equal(menu[0].icon, 'Home');

  assert.equal(menu[1].label, 'Inventaris');
  assert.equal(menu[1].href, '/peminjam/inventaris');
  assert.equal(menu[1].icon, 'Package');

  assert.equal(menu[2].label, 'Pengajuan Saya');
  assert.equal(menu[2].href, '/peminjam/pengajuan-saya');
  assert.equal(menu[2].icon, 'HandCoins');
  assert.equal(Array.isArray(menu[2].children), true);
  assert.equal(menu[2].children.length, 2);
  assert.equal(menu[2].children[0].label, 'Peminjaman');
  assert.equal(menu[2].children[0].href, '/peminjam/pengajuan-saya/peminjaman');
  assert.equal(menu[2].children[1].label, 'Pengembalian');
  assert.equal(menu[2].children[1].href, '/peminjam/pengajuan-saya/pengembalian');
  assert.equal(menu[2].firstChildHref, '/peminjam/pengajuan-saya/peminjaman');

  assert.equal(menu[3].label, 'Pengajuan PJ');
  assert.equal(menu[3].href, '/peminjam/pengajuan-pj');
  assert.equal(menu[3].icon, 'UserRoundPlus');

  assert.equal(menu[4].label, 'Tata Tertib');
  assert.equal(menu[4].href, '/peminjam/tata-tertib');
  assert.equal(menu[4].icon, 'FileText');
});

test('menu PJ: isi dan urutan sesuai desain (6 item tanpa submenu, Laporan TIDAK ada)', () => {
  const menu = getMenuForRole(ROLES.PENANGGUNG_JAWAB);
  assert.equal(menu.length, 6);

  assert.equal(menu[0].label, 'Dashboard');
  assert.equal(menu[0].href, '/pj/dashboard');

  assert.equal(menu[1].label, 'Kelola Inventaris');
  assert.equal(menu[1].href, '/pj/inventaris');

  assert.equal(menu[2].label, 'Kelola Peminjaman');
  assert.equal(menu[2].href, '/pj/peminjaman');

  assert.equal(menu[3].label, 'Kelola Pengembalian');
  assert.equal(menu[3].href, '/pj/pengembalian');

  assert.equal(menu[4].label, 'List Pengajuan PJ');
  assert.equal(menu[4].href, '/pj/pengajuan-pj');

  assert.equal(menu[5].label, 'Kelola Pengguna');
  assert.equal(menu[5].href, '/pj/pengguna');

  const hasLaporan = menu.some((i) => i.label.toLowerCase().includes('laporan'));
  assert.equal(hasLaporan, false, 'Menu Laporan BELUM ada di desain sidebar PJ.');
});

test('getMenuForRole role tak dikenal → array kosong', () => {
  assert.deepEqual(getMenuForRole('super-admin'), []);
  assert.deepEqual(getMenuForRole(undefined), []);
});

/* ========================================================================== */
/*                               isActivePath                                  */
/* ========================================================================== */

test('isActivePath: cocok persis → true', () => {
  assert.equal(isActivePath('/peminjam/dashboard', '/peminjam/dashboard'), true);
  assert.equal(isActivePath('/pj/pengguna', '/pj/pengguna'), true);
});

test('isActivePath: parent aktif karena anak aktif (prefix dengan batas "/")', () => {
  assert.equal(
    isActivePath('/peminjam/pengajuan-saya', '/peminjam/pengajuan-saya/peminjaman'),
    true
  );
  assert.equal(
    isActivePath('/peminjam/pengajuan-saya', '/peminjam/pengajuan-saya/pengembalian'),
    true
  );
});

test('isActivePath: trailing slash dinormalisasi', () => {
  assert.equal(isActivePath('/peminjam/inventaris/', '/peminjam/inventaris'), true);
  assert.equal(isActivePath('/peminjam/inventaris', '/peminjam/inventaris/'), true);
});

test('isActivePath: TIDAK cocok sibling yang awalan mirip (/inventaris vs /inventaris-lama)', () => {
  assert.equal(isActivePath('/peminjam/inventaris', '/peminjam/inventaris-lama'), false);
  assert.equal(isActivePath('/peminjam/request', '/peminjam/request-pj'), false);
});

test('isActivePath: item Inventaris aktif di halaman detail dan sub-halaman ajukan', () => {
  assert.equal(isActivePath('/peminjam/inventaris', '/peminjam/inventaris/7'), true);
  assert.equal(isActivePath('/peminjam/inventaris', '/peminjam/inventaris/7/ajukan'), true);
  assert.equal(isActivePath('/peminjam/inventaris', '/peminjam/inventaris-lama'), false);
});

test('isActivePath: input non-string / kosong → false (aman)', () => {
  assert.equal(isActivePath(null, '/x'), false);
  assert.equal(isActivePath('/x', undefined), false);
  assert.equal(isActivePath('', ''), true);
});

/* ========================================================================== */
/*                               getPageTitle                                  */
/* ========================================================================== */

test('getPageTitle untuk route Peminjam: Dashboard', () => {
  const { title, icon } = getPageTitle('/peminjam/dashboard', ROLES.PEMINJAM);
  assert.equal(title, 'Dashboard');
  assert.equal(icon, 'Home');
});

test('getPageTitle untuk route Peminjam: Inventaris', () => {
  const { title, icon } = getPageTitle('/peminjam/inventaris', ROLES.PEMINJAM);
  assert.equal(title, 'Inventaris');
  assert.equal(icon, 'Package');
});

test('getPageTitle: route detail dan ajukan peminjam tetap berjudul Inventaris', () => {
  const detail = getPageTitle('/peminjam/inventaris/7', ROLES.PEMINJAM);
  assert.equal(detail.title, 'Inventaris');
  assert.equal(detail.icon, 'Package');

  const ajukan = getPageTitle('/peminjam/inventaris/7/ajukan', ROLES.PEMINJAM);
  assert.equal(ajukan.title, 'Inventaris');
  assert.equal(ajukan.icon, 'Package');
});

test('getPageTitle untuk anak Pengajuan Saya > Peminjaman: label anak, icon induk', () => {
  const { title, icon } = getPageTitle('/peminjam/pengajuan-saya/peminjaman', ROLES.PEMINJAM);
  assert.equal(title, 'Peminjaman');
  assert.equal(icon, 'HandCoins');
});

test('getPageTitle untuk anak Pengajuan Saya > Pengembalian: label anak, icon induk', () => {
  const { title, icon } = getPageTitle('/peminjam/pengajuan-saya/pengembalian', ROLES.PEMINJAM);
  assert.equal(title, 'Pengembalian');
  assert.equal(icon, 'HandCoins');
});

test('getPageTitle: Pengajuan PJ peminjam', () => {
  const { title } = getPageTitle('/peminjam/pengajuan-pj', ROLES.PEMINJAM);
  assert.equal(title, 'Pengajuan PJ');
});

test('getPageTitle: Tata Tertib peminjam', () => {
  const { title } = getPageTitle('/peminjam/tata-tertib', ROLES.PEMINJAM);
  assert.equal(title, 'Tata Tertib');
});

test('getPageTitle untuk route PJ: Kelola Inventaris', () => {
  const { title } = getPageTitle('/pj/inventaris', ROLES.PENANGGUNG_JAWAB);
  assert.equal(title, 'Kelola Inventaris');
});

test('getPageTitle untuk route PJ: Kelola Pengembalian', () => {
  const { title } = getPageTitle('/pj/pengembalian', ROLES.PENANGGUNG_JAWAB);
  assert.equal(title, 'Kelola Pengembalian');
});

test('getPageTitle untuk route PJ: List Pengajuan PJ', () => {
  const { title } = getPageTitle('/pj/pengajuan-pj', ROLES.PENANGGUNG_JAWAB);
  assert.equal(title, 'List Pengajuan PJ');
});

test('getPageTitle: Kelola Pengguna PJ', () => {
  const { title } = getPageTitle('/pj/pengguna', ROLES.PENANGGUNG_JAWAB);
  assert.equal(title, 'Kelola Pengguna');
});

test('getPageTitle untuk route tak dikenal → title kosong, icon null', () => {
  const { title, icon } = getPageTitle('/peminjam/ngawur', ROLES.PEMINJAM);
  assert.equal(title, '');
  assert.equal(icon, null);
});

/* ========================================================================== */
/*                                getInitials                                  */
/* ========================================================================== */

test('getInitials: nama dua kata → huruf pertama masing-masing (Maitri Sakti → MS)', () => {
  assert.equal(getInitials('Maitri Sakti'), 'MS');
});

test('getInitials: satu kata → 2 huruf pertama kapital (Budi → BU)', () => {
  assert.equal(getInitials('Budi'), 'BU');
});

test('getInitials: satu kata 1 huruf → 1 huruf', () => {
  assert.equal(getInitials('X'), 'X');
});

test('getInitials: spasi ganda antara kata (  dua   spasi  ) → DS', () => {
  assert.equal(getInitials('  dua   spasi  '), 'DS');
});

test('getInitials: string kosong / whitespace / non-string → ""', () => {
  assert.equal(getInitials(''), '');
  assert.equal(getInitials('     '), '');
  assert.equal(getInitials(null), '');
  assert.equal(getInitials(undefined), '');
  assert.equal(getInitials(1234), '');
});
