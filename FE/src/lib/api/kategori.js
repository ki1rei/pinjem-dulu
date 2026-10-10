/**
 * Service KATEGORI.
 * Mock: ambil dari data/mock/kategori.js. Non-mock: panggil Axios.
 */

import { mockKategori } from '../../data/mock/kategori.js';
import { apiClient, delay, isMockEnabled } from './client.js';

/**
 * Daftar kategori inventaris.
 * @returns {Promise<Array<{idKategori:string, namaKategori:string}>>}
 */
export async function getKategori() {
  if (isMockEnabled()) {
    await delay(80);
    // Map ke idKategori, namaKategori sesuai kontrak.
    return mockKategori.map((k) => ({
      idKategori: k.idKategori,
      namaKategori: k.namaKategori,
    }));
  }

  const { data } = await apiClient.get('/kategori');
  return data;
}
