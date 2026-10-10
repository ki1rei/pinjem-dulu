/**
 * Service INVENTARIS sisi peminjam (dan umum).
 * Mock: data/mock/inventaris.js. Non-mock: Axios client.
 *
 * Kontrak API (docs/API-CONTRACT.md § Inventaris):
 *   GET /inventaris?search=&idKategori=a,b&idOrganisasi=c,d&page=1&limit=8
 *   GET /inventaris/:id
 *   GET /inventaris/:id/peminjaman-aktif
 */

import { mockInventaris, getMockPeminjamanAktifById } from '../../data/mock/inventaris.js';
import { apiClient, delay, isMockEnabled } from './client.js';

/* -------------------------------------------------------------------------- */
/*                             HELPER SERVICE                                 */
/* -------------------------------------------------------------------------- */

function throwNotFound(pesan = 'Data tidak ditemukan.') {
  const err = new Error(pesan);
  err.status = 404;
  err.statusCode = 404;
  throw err;
}

/* -------------------------------------------------------------------------- */
/*                           LIST + PAGINATION                                */
/* -------------------------------------------------------------------------- */

const DEFAULTS = Object.freeze({
  page: 1,
  limit: 8,
});

/**
 * Ambil daftar inventaris dengan filter + pagination.
 *
 * @param {{ search?: string, idKategori?: Array<string>, idOrganisasi?: Array<string>, page?: number, limit?: number }} param0
 * @returns {Promise<{ data: Array<object>, meta: { page: number, limit: number, total: number } }>}
 */
export async function getInventarisList({
  search = '',
  idKategori = [],
  idOrganisasi = [],
  page = DEFAULTS.page,
  limit = DEFAULTS.limit,
} = {}) {
  if (isMockEnabled()) {
    await delay(120);
    let arr = [...mockInventaris];

    // Filter by nama (search, case-insensitive).
    const q = typeof search === 'string' ? search.trim().toLowerCase() : '';
    if (q) {
      arr = arr.filter((it) => (it.namaBarang || '').toLowerCase().includes(q));
    }

    // Filter by idKategori (banyak = OR).
    const cats = Array.isArray(idKategori)
      ? idKategori.filter((x) => typeof x === 'string' && x.length > 0)
      : [];
    if (cats.length > 0) {
      const set = new Set(cats);
      arr = arr.filter((it) => set.has(it.idKategori));
    }

    // Filter by idOrganisasi (banyak = OR).
    const okis = Array.isArray(idOrganisasi)
      ? idOrganisasi.filter((x) => typeof x === 'string' && x.length > 0)
      : [];
    if (okis.length > 0) {
      const set = new Set(okis);
      arr = arr.filter((it) => set.has(it.idOrganisasi));
    }

    // Pagination.
    const total = arr.length;
    const pageNum = Number.isFinite(+page) && +page >= 1 ? Math.floor(+page) : 1;
    const limNum = Number.isFinite(+limit) && +limit >= 1 ? Math.floor(+limit) : DEFAULTS.limit;
    const start = (pageNum - 1) * limNum;
    const end = start + limNum;
    const sliced = start >= total ? [] : arr.slice(start, end);

    return {
      data: sliced,
      meta: { page: pageNum, limit: limNum, total },
    };
  }

  // Non-mock: Axios. Filter array dikirim sebagai string koma.
  const params = {
    page: +page || DEFAULTS.page,
    limit: +limit || DEFAULTS.limit,
  };
  if (search) params.search = search;
  if (Array.isArray(idKategori) && idKategori.length) {
    params.idKategori = idKategori.join(',');
  }
  if (Array.isArray(idOrganisasi) && idOrganisasi.length) {
    params.idOrganisasi = idOrganisasi.join(',');
  }

  const { data } = await apiClient.get('/inventaris', { params });
  return data;
}

/* -------------------------------------------------------------------------- */
/*                               DETAIL                                       */
/* -------------------------------------------------------------------------- */

/**
 * Ambil satu inventaris berdasarkan id.
 * @param {string} id
 * @returns {Promise<object>} inventaris.
 * @throws Error(status=404) bila id tidak ditemukan.
 */
export async function getInventarisById(id) {
  if (isMockEnabled()) {
    await delay(80);
    const inv = mockInventaris.find((it) => it.idInventaris === id);
    if (!inv) throwNotFound('Barang tidak ditemukan.');
    return inv;
  }

  try {
    const { data } = await apiClient.get(`/inventaris/${encodeURIComponent(id)}`);
    return data;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404) throwNotFound('Barang tidak ditemukan.');
    throw e;
  }
}

/* -------------------------------------------------------------------------- */
/*                         PEMINJAMAN AKTIF (jadwal)                         */
/* -------------------------------------------------------------------------- */

/**
 * Daftar booking aktif (peminjaman) terkait satu inventaris.
 * Digunakan untuk daftar jadwal di halaman detail dan simulasi kuota.
 *
 * @param {string} id
 * @returns {Promise<Array<object>>}
 */
export async function getPeminjamanAktif(id) {
  if (isMockEnabled()) {
    await delay(80);
    const inv = mockInventaris.find((it) => it.idInventaris === id);
    if (!inv) throwNotFound('Barang tidak ditemukan.');
    return getMockPeminjamanAktifById(id);
  }

  const { data } = await apiClient.get(`/inventaris/${encodeURIComponent(id)}/peminjaman-aktif`);
  return Array.isArray(data) ? data : [];
}
