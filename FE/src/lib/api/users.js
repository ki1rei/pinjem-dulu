import { mockUsers } from '@/data/mock';
import { apiClient, delay, isMockEnabled } from './client';

/** Contoh: daftar pengguna. */
export async function getUsers() {
  if (isMockEnabled()) {
    await delay();
    return mockUsers;
  }

  const { data } = await apiClient.get('/users');
  return data;
}
