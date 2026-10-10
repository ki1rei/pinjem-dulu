import { ROLES, STATUS_AKUN } from '../../lib/constants.js';
import { mockOrganisasi } from './organisasi.js';

const [bemFt, ukmFoto] = mockOrganisasi;

/*
 * Mock pengguna (FE only, backend impor akun via seed / admin).
 * Semua akun diberi email, karena login via email + captcha (bukan NIM).
 */
export const mockUsers = [
  {
    id: 'user-1',
    nama: 'Maitri Sakti',
    nim: '254107020789',
    email: 'maitri.sakti@mailinator.com',
    organisasi: bemFt,
    role: ROLES.PEMINJAM,
    status_akun: STATUS_AKUN.AKTIF,
  },
  {
    id: 'user-2',
    nama: 'Siti Rahma',
    nim: '2101987654',
    email: 'siti.rahma@bemft.uma.ac.id',
    organisasi: bemFt,
    role: ROLES.PENANGGUNG_JAWAB,
    status_akun: STATUS_AKUN.AKTIF,
  },
  {
    id: 'user-3',
    nama: 'Budi Santoso',
    nim: '2201112233',
    email: 'budi.santoso@ukmfoto.uma.ac.id',
    organisasi: ukmFoto,
    role: ROLES.PENANGGUNG_JAWAB,
    status_akun: STATUS_AKUN.AKTIF,
  },
  {
    id: 'user-4',
    nama: 'Aulia Putri',
    nim: '2301555666',
    email: 'auliaputri@mailinator.com',
    organisasi: bemFt,
    role: ROLES.PEMINJAM,
    status_akun: STATUS_AKUN.NONAKTIF,
  },
];
