import { mockRequestPj } from '@/data/mock';
import { apiClient, delay, isMockEnabled } from './client';

/** Contoh: daftar permintaan jadi penanggung jawab. */
export async function getRequestPj() {
  if (isMockEnabled()) {
    await delay();
    return mockRequestPj;
  }

  const { data } = await apiClient.get('/request-pj');
  return data;
}
