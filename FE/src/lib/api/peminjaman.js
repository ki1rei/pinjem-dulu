/**
 * Service PEMINJAMAN.
 * Kontrak API: docs/API-CONTRACT.md § Peminjaman
 *
 * Mendukung mode mock (NEXT_PUBLIC_USE_MOCK=true) dan Axios (backend terpisah).
 */

import {
  mockPeminjaman,
  addMockPeminjaman,
  resetMockPeminjaman,
  getNextPeminjamanId,
} from '../../data/mock/peminjaman.js';
import {
  mockInventaris,
  addMockBooking,
  getMockPeminjamanAktifById,
  resetMockInventarisAndBookings,
  getMockToday,
} from '../../data/mock/inventaris.js';
import { mockUsers } from '../../data/mock/users.js';
import { apiClient, delay, isMockEnabled } from './client.js';
import { STATUS_PEMINJAMAN, AUTH_STORAGE_KEY } from '../constants.js';
import {
  getEarliestStartDate,
  isRangeAvailable,
  getMaxEndDate,
  getCommittedQuota,
  simulateQuotaWith,
} from '../date-rules.js';
import { dateToISO, isoToDate } from '../format.js';

/* -------------------------------------------------------------------------- */
/*                                HELPER INTERNAL                             */
/* -------------------------------------------------------------------------- */

function shiftDateStr(isoString, offsetDays) {
  const d = isoToDate(isoString);
  if (!d) return isoString;
  d.setDate(d.getDate() + offsetDays);
  return dateToISO(d);
}

function getMockCurrentUser() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (u) return u;
      }
    } catch {
      // Abaikan bila storage tidak tersedia
    }
  }
  return mockUsers[0];
}

/* -------------------------------------------------------------------------- */
/*                              SERVICE EXPORTS                               */
/* -------------------------------------------------------------------------- */

/**
 * Reset seluruh state mock peminjaman dan inventaris (untuk test).
 * @internal
 */
export function _resetPeminjamanMockState() {
  resetMockPeminjaman();
  resetMockInventarisAndBookings();
}

/**
 * Dapatkan string tanggal acuan "hari ini" (ISO YYYY-MM-DD).
 * Dalam mode mock, mengambil tanggal mock aktif (termasuk override bila ada).
 * Di luar mode mock, mengembalikan tanggal hari ini waktu lokal.
 *
 * @returns {string} Tanggal acuan dalam format YYYY-MM-DD
 */
export function getSystemToday() {
  if (isMockEnabled()) {
    return getMockToday();
  }
  return dateToISO(new Date());
}

/**
 * Daftar peminjaman.
 * @param {object} [params]
 */
export async function getPeminjaman(params = {}) {
  if (isMockEnabled()) {
    await delay(80);
    return [...mockPeminjaman];
  }

  const { data } = await apiClient.get('/peminjaman', { params });
  return data;
}

/**
 * Daftar peminjaman yang berkaitan dengan satu barang (berdasarkan barang.id atau idInventaris).
 * @param {string} barangId
 */
export async function getPeminjamanByBarang(barangId) {
  if (isMockEnabled()) {
    await delay(80);
    return mockPeminjaman.filter(
      (p) =>
        p?.barang?.id === barangId ||
        p?.barang?.idInventaris === barangId ||
        p?.inventaris?.idInventaris === barangId
    );
  }

  const { data } = await apiClient.get('/peminjaman', {
    params: { barang_id: barangId },
  });
  return data;
}

/**
 * Ajukan peminjaman baru.
 *
 * @param {object} payload
 * @param {string} payload.idInventaris
 * @param {string} payload.startDate
 * @param {string} payload.endDate
 * @param {number} payload.jumlahPinjam
 * @param {string} payload.keperluan
 * @returns {Promise<object>} Objek Peminjaman sesuai kontrak API.
 */
export async function createPeminjaman({
  idInventaris,
  startDate,
  endDate,
  jumlahPinjam,
  keperluan,
}) {
  if (isMockEnabled()) {
    await delay(100);

    // 1. Cek keberadaan inventaris
    const inv = mockInventaris.find((it) => String(it.idInventaris) === String(idInventaris));
    if (!inv) {
      const err = new Error('Inventaris tidak ditemukan.');
      err.status = 404;
      err.statusCode = 404;
      err.response = { status: 404, data: { message: 'Inventaris tidak ditemukan.' } };
      throw err;
    }

    // 2. Validasi field
    const errors = {};
    const today = getSystemToday();

    // Keperluan
    if (!keperluan || typeof keperluan !== 'string' || !keperluan.trim()) {
      errors.keperluan = 'Keperluan peminjaman wajib diisi.';
    }

    // Jumlah pinjam
    const qty = Number(jumlahPinjam);
    if (!Number.isInteger(qty) || qty <= 0) {
      errors.jumlahPinjam = 'Jumlah pinjam harus berupa bilangan bulat positif.';
    } else if (qty > inv.totalBarang) {
      errors.jumlahPinjam = `Jumlah pinjam (${qty}) melebihi total barang (${inv.totalBarang}).`;
    }

    // Tanggal mulai (H+2)
    const earliest = getEarliestStartDate(today);
    if (!startDate) {
      errors.startDate = 'Tanggal mulai wajib diisi.';
    } else if (isoToDate(startDate) === null) {
      errors.startDate = 'Format tanggal mulai tidak valid.';
    } else if (startDate < earliest) {
      errors.startDate = `Tanggal mulai paling awal ${earliest}`;
    }

    // Tanggal selesai
    if (!endDate) {
      errors.endDate = 'Tanggal selesai wajib diisi.';
    } else if (isoToDate(endDate) === null) {
      errors.endDate = 'Format tanggal selesai tidak valid.';
    } else if (startDate && isoToDate(startDate) !== null && endDate < startDate) {
      errors.endDate = 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
    }

    // 3. Validasi aturan tanggal & kuota (bila format dasar valid)
    if (!errors.startDate && !errors.endDate && !errors.jumlahPinjam) {
      const bookings = getMockPeminjamanAktifById(inv.idInventaris);
      const maxEnd = getMaxEndDate(startDate, bookings, {
        totalBarang: inv.totalBarang,
        jumlah: qty,
        today,
      });

      if (maxEnd !== null && maxEnd !== Infinity && endDate > maxEnd) {
        errors.endDate = `Tanggal selesai melewati batas maksimal yang tersedia (${maxEnd})`;
      }

      const rangeCheck = isRangeAvailable(startDate, endDate, bookings, {
        totalBarang: inv.totalBarang,
        jumlah: qty,
        today,
      });

      if (!rangeCheck.ok) {
        // Cari hari spesifik yang kuotanya melebihi
        const sDate = isoToDate(startDate);
        const eDate = isoToDate(endDate);
        const tDate = isoToDate(today);
        const lo = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() - 1);
        const hi = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate() + 1);

        for (let x = new Date(lo.getTime()); x <= hi; x.setDate(x.getDate() + 1)) {
          const committed = getCommittedQuota(x, bookings, tDate);
          const after = simulateQuotaWith(x, bookings, tDate, {
            start: sDate,
            end: eDate,
            qty,
          });
          if (after > inv.totalBarang) {
            const sisa = Math.max(0, inv.totalBarang - committed);
            const dayStr = dateToISO(x);
            if (!errors.endDate) {
              errors.jumlahPinjam = `Sisa barang pada ${dayStr} hanya ${sisa}`;
            }
            break;
          }
        }

        if (!errors.jumlahPinjam && !errors.endDate) {
          errors.jumlahPinjam = rangeCheck.reason || 'Kuota barang tidak mencukupi.';
        }
      }
    }

    // Bila ada error validasi
    if (Object.keys(errors).length > 0) {
      const err = new Error('Validasi gagal.');
      err.status = 422;
      err.statusCode = 422;
      err.errors = errors;
      err.response = { status: 422, data: { message: 'Validasi gagal.', errors } };
      throw err;
    }

    // 4. Bangun objek Peminjaman sesuai kontrak API
    const user = getMockCurrentUser();
    const bufferStartDate = shiftDateStr(startDate, -1);
    const bufferEndDate = shiftDateStr(endDate, 1);
    const idPeminjaman = getNextPeminjamanId();

    const peminjamanBaru = {
      idPeminjaman,
      id: `pinjam-${idPeminjaman}`,
      pengguna: {
        nim: user.nim || '254107020789',
        nama: user.nama || 'Maitri Sakti',
      },
      peminjam: user,
      inventaris: {
        idInventaris: inv.idInventaris,
        namaBarang: inv.namaBarang,
        namaOrganisasi: inv.namaOrganisasi,
        thumbnail: inv.thumbnail,
      },
      barang: inv,
      tanggalPengajuan: new Date().toISOString().replace('Z', '').slice(0, 19),
      startDate,
      endDate,
      mulai: startDate,
      selesai: endDate,
      bufferStartDate,
      bufferEndDate,
      tanggalPengembalian: null,
      status: STATUS_PEMINJAMAN.DIAJUKAN,
      alasanPenolakan: null,
      keperluan: keperluan.trim(),
      jumlahPinjam: qty,
      kondisiSebelum: null,
      deskripsiSebelum: null,
      kondisiSesudah: null,
      deskripsiSesudah: null,
      sanksi: null,
    };

    // Tambahkan ke store peminjaman mock
    addMockPeminjaman(peminjamanBaru);

    // Tambahkan ke store booking aktif inventaris
    addMockBooking(inv.idInventaris, {
      startDate,
      endDate,
      bufferStartDate,
      bufferEndDate,
      jumlahPinjam: qty,
      status: STATUS_PEMINJAMAN.DIAJUKAN,
      keperluan: keperluan.trim(),
      namaOrganisasi: user?.organisasi?.namaOrganisasi || user?.namaOrganisasi || 'BEM',
    });

    return peminjamanBaru;
  }

  // Non-mock: Axios
  try {
    const { data } = await apiClient.post('/peminjaman', {
      idInventaris,
      startDate,
      endDate,
      jumlahPinjam,
      keperluan,
    });
    return data;
  } catch (err) {
    if (err?.response?.data?.errors) {
      err.errors = err.response.data.errors;
    }
    if (err?.response?.status) {
      err.status = err.response.status;
      err.statusCode = err.response.status;
    }
    throw err;
  }
}
