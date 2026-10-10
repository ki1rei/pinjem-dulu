import test from 'node:test';
import assert from 'node:assert/strict';

// Aktifkan mode mock agar service pakai data dari data/mock/.
process.env.NEXT_PUBLIC_USE_MOCK = 'true';

import {
  getInventarisList,
  getInventarisById,
  getPeminjamanAktif,
} from '../src/lib/api/inventaris.js';
import { mockKategori } from '../src/data/mock/kategori.js';
import { mockOrganisasi } from '../src/data/mock/organisasi.js';
import { mockInventaris } from '../src/data/mock/inventaris.js';

const kat = Object.fromEntries(mockKategori.map((k) => [k.namaKategori, k]));
const oki = Object.fromEntries(mockOrganisasi.map((o) => [o.namaOrganisasi, o]));

/* -------------------------------------------------------------------------- */
/*                               PREKONDISI                                   */
/* -------------------------------------------------------------------------- */

test('mock data inventaris: minimal 12 barang, 5 kategori, 6+ OKI', () => {
  assert.ok(mockInventaris.length >= 12, `minimal 12 inventaris (punya ${mockInventaris.length})`);
  const unikKategori = new Set(mockInventaris.map((i) => i.idKategori));
  assert.ok(unikKategori.size >= 5, 'minimal 5 kategori terwakili di inventaris');
  const unikOKI = new Set(mockInventaris.map((i) => i.idOrganisasi));
  assert.ok(unikOKI.size >= 6, 'minimal 6 OKI terwakili di inventaris');
});

test('sisaHariIni selalu antara 0 dan totalBarang (invarian)', () => {
  for (const it of mockInventaris) {
    assert.ok(
      Number.isFinite(it.sisaHariIni) && it.sisaHariIni >= 0,
      `${it.idInventaris} (${it.namaBarang}): sisaHariIni ≥ 0 (punya ${it.sisaHariIni})`
    );
    assert.ok(
      it.sisaHariIni <= it.totalBarang,
      `${it.idInventaris} (${it.namaBarang}): sisaHariIni ≤ totalBarang`
    );
  }
});

test('minimal satu inventaris sisaHariIni = 0 (barang habis hari ini)', () => {
  const habis = mockInventaris.filter((i) => i.sisaHariIni === 0);
  assert.ok(habis.length >= 1, 'sedikitnya 1 barang dengan sisaHariIni = 0');
});

/* -------------------------------------------------------------------------- */
/*                               PENCARIAN                                    */
/* -------------------------------------------------------------------------- */

test('getInventarisList: search tidak peka huruf besar-kecil', async () => {
  const { data: d1 } = await getInventarisList({ search: 'proyektor' });
  assert.ok(d1.length >= 1, 'kecil: "proyektor" temukan');
  const { data: d2 } = await getInventarisList({ search: 'EPSON' });
  assert.ok(d2.length >= 1, 'besar: "EPSON" temukan');
  const { data: d3 } = await getInventarisList({ search: 'XXXXXXX-ZZZ' });
  assert.equal(d3.length, 0, 'kata kunci tidak cocok → data kosong');
});

/* -------------------------------------------------------------------------- */
/*                                FILTER                                      */
/* -------------------------------------------------------------------------- */

test('getInventarisList: filter 1 kategori', async () => {
  const idKat = kat['Elektronik'].idKategori;
  const { data } = await getInventarisList({ idKategori: [idKat] });
  for (const it of data) assert.equal(it.idKategori, idKat);
  assert.ok(data.length >= 1, 'minimal 1 di kategori Elektronik');
});

test('getInventarisList: multi kategori = OR', async () => {
  const ids = [kat['Audio'].idKategori, kat['Alat Musik'].idKategori];
  const { data } = await getInventarisList({ idKategori: ids });
  assert.ok(data.length >= 2, 'Audio + Alat Musik menghasilkan ≥2 barang');
  for (const it of data) {
    assert.ok(ids.includes(it.idKategori), 'harus salah satu dari dua kategori');
  }
});

test('getInventarisList: filter 1 OKI', async () => {
  const idOki = oki['BEM'].idOrganisasi;
  const { data } = await getInventarisList({ idOrganisasi: [idOki] });
  assert.ok(data.length >= 1, 'minimal 1 inventaris milik BEM');
  for (const it of data) assert.equal(it.idOrganisasi, idOki);
});

test('getInventarisList: multi OKI = OR', async () => {
  const ids = [oki['HMTI'].idOrganisasi, oki['HMS'].idOrganisasi];
  const { data } = await getInventarisList({ idOrganisasi: ids });
  assert.ok(data.length >= 2, 'HMTI + HMS menghasilkan ≥2 barang');
  for (const it of data) {
    assert.ok(ids.includes(it.idOrganisasi), 'harus salah satu dari dua OKI');
  }
});

test('getInventarisList: search + kategori + OKI = AND', async () => {
  // Proyektor BEM (ada) vs Proyektor HMS (tidak ada).
  const bem = oki['BEM'].idOrganisasi;
  const elektronik = kat['Elektronik'].idKategori;
  const { data: ada } = await getInventarisList({
    search: 'Proyektor',
    idKategori: [elektronik],
    idOrganisasi: [bem],
  });
  assert.ok(ada.length >= 1, 'Proyektor Elektronik BEM ada');

  const hms = oki['HMS'].idOrganisasi;
  const { data: tidakAda } = await getInventarisList({
    search: 'Proyektor',
    idKategori: [elektronik],
    idOrganisasi: [hms],
  });
  assert.equal(tidakAda.length, 0, 'Proyektor Elektronik HMS tidak ada → kosong');
});

/* -------------------------------------------------------------------------- */
/*                              PAGINATION                                    */
/* -------------------------------------------------------------------------- */

test('getInventarisList: halaman 1 limit 8 → meta.total = jumlah mock total', async () => {
  const { data, meta } = await getInventarisList({ page: 1, limit: 8 });
  assert.equal(meta.page, 1);
  assert.equal(meta.limit, 8);
  assert.equal(meta.total, mockInventaris.length);
  assert.ok(data.length <= 8, 'halaman pertama tidak melebihi limit');
  assert.ok(data.length >= 1, 'halaman pertama punya data');
});

test('getInventarisList: halaman 2 limit 8 → sisa barang', async () => {
  const { data, meta } = await getInventarisList({ page: 2, limit: 8 });
  assert.equal(meta.page, 2);
  const expectedSisa = Math.max(0, mockInventaris.length - 8);
  assert.equal(data.length, expectedSisa);
});

test('getInventarisList: halaman di luar jangkauan → data kosong, meta.total tetap', async () => {
  const { data, meta } = await getInventarisList({ page: 99, limit: 8 });
  assert.deepEqual(data, []);
  assert.equal(meta.total, mockInventaris.length);
  assert.equal(meta.page, 99);
});

/* -------------------------------------------------------------------------- */
/*                           DETAIL + 404                                     */
/* -------------------------------------------------------------------------- */

test('getInventarisById: id ada → kembalikan inventaris penuh', async () => {
  const inv = await getInventarisById(mockInventaris[0].idInventaris);
  assert.equal(inv.idInventaris, mockInventaris[0].idInventaris);
  assert.ok(inv.namaBarang.length > 0);
  assert.ok('idKategori' in inv && 'namaKategori' in inv);
  assert.ok('idOrganisasi' in inv && 'namaOrganisasi' in inv);
  assert.ok('totalBarang' in inv && 'sisaHariIni' in inv);
  assert.ok('kondisi' in inv);
  assert.ok('deskripsiBarang' in inv);
  assert.ok('thumbnail' in inv);
});

test('getInventarisById: id tidak ada → throw error status 404', async () => {
  await assert.rejects(
    () => getInventarisById('inv-TIDAK-ADA-999'),
    (err) => {
      return (
        err &&
        (err.status === 404 || err.statusCode === 404) &&
        /tidak ditemukan/i.test(err.message || '')
      );
    }
  );
});

/* -------------------------------------------------------------------------- */
/*                         PEMINJAMAN AKTIF (jadwal)                         */
/* -------------------------------------------------------------------------- */

test('getPeminjamanAktif: data selalu array dan urut startDate ASC', async () => {
  // Pilih barang yang punya booking.
  const punyaBooking = (
    await Promise.all(
      mockInventaris
        .slice(0, 5)
        .map(async (inv) => [inv.idInventaris, await getPeminjamanAktif(inv.idInventaris)])
    )
  ).find(([, list]) => list.length >= 1);

  assert.ok(punyaBooking, 'minimal satu barang punya booking aktif');
  const list = punyaBooking[1];
  assert.ok(Array.isArray(list));
  for (const b of list) {
    assert.ok('startDate' in b && /^\d{4}-\d{2}-\d{2}$/.test(b.startDate));
    assert.ok('endDate' in b);
    assert.ok('bufferStartDate' in b);
    assert.ok('bufferEndDate' in b);
    assert.ok('jumlahPinjam' in b && b.jumlahPinjam >= 1);
    assert.ok('status' in b);
    assert.ok('keperluan' in b);
    assert.ok('namaOrganisasi' in b);
  }
  for (let i = 1; i < list.length; i++) {
    assert.ok(list[i - 1].startDate <= list[i].startDate, 'urut startDate ASC');
  }
});
