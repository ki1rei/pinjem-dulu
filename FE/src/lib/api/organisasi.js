/**
 * Service ORGANISASI.
 * Mock: ambil dari data/mock/organisasi.js. Non-mock: panggil Axios.
 */

import { mockOrganisasi } from '../../data/mock/organisasi.js';
import { apiClient, delay, isMockEnabled } from './client.js';

/**
 * Daftar organisasi / OKI.
 * @returns {Promise<Array<{idOrganisasi:string, namaOrganisasi:string, icon:string|null}>>}
 */
export async function getOrganisasi() {
  if (isMockEnabled()) {
    await delay(80);
    return mockOrganisasi.map((o) => ({
      idOrganisasi: o.idOrganisasi,
      namaOrganisasi: o.namaOrganisasi,
      icon: o.icon ?? null,
    }));
  }

  const { data } = await apiClient.get('/organisasi');
  return data;
}
