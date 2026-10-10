import { mockPengembalian } from '@/data/mock';
import { apiClient, delay, isMockEnabled } from './client';

/** Contoh: daftar pengembalian. */
export async function getPengembalian() {
  if (isMockEnabled()) {
    await delay();
    return mockPengembalian;
  }

  const { data } = await apiClient.get('/pengembalian');
  return data;
}
