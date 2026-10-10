import { mockUsers, mockOrganisasi } from '../../data/mock/index.js';
import { ROLES, STATUS_AKUN } from '../constants.js';
import { apiClient, delay, isMockEnabled } from './client.js';

/**
 * Daftar user mutable untuk mode mock.
 * Dimulai dengan copy dari mockUsers.
 * Dipisah dari berkas mock agar test dapat di-reset.
 */
let mockUsersMutable = [...mockUsers];

/**
 * Map captchaId → { answer, createdAt } untuk mode mock.
 * Expired secara sederhana: captcha lebih dari 5 menit dianggap kadaluarsa.
 * Hanya untuk mode mock; backend nanti yang kelola penerbitan + validasi captcha.
 * @internal
 */
const mockCaptchaStore = new Map();

/**
 * Reset state user mock ke data awal mockUsers.
 * Hanya untuk keperluan test. TIDAK dipanggil di kode produksi.
 * @internal
 */
export function _resetAuthMockState() {
  mockUsersMutable = [...mockUsers];
  mockCaptchaStore.clear();
}

/**
 * Ambil user berikutnya (untuk mock).
 * @internal
 */
function getUsersMock() {
  return mockUsersMutable;
}

/**
 * Simpan organisasi berdasarkan id, dari mockOrganisasi atau fallback.
 * @param {string|{id:string}} org
 */
function resolveOrganisasi(org) {
  const id = typeof org === 'string' ? org : org?.id;
  if (!id) return null;
  return mockOrganisasi.find((o) => o.id === id) || null;
}

function sanitizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    nama: raw.nama,
    nim: raw.nim,
    email: raw.email,
    organisasi: raw.organisasi,
    role: raw.role,
  };
}

/* ========================================================================== */
/*                              CAPTCHA MOCK                                   */
/* ========================================================================== */

const CAPTCHA_CHARS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Buat teks captcha acak 4 huruf kecil + id-nya.
 * Mode mock: captcha dibuat & divalidasi di frontend.
 * Mode non-mock: GET /auth/captcha → `{ captchaId, imageUrl }` (TODO(keputusan):
 *   backend menerbitkan & memvalidasi captcha. FE cukup memanggil endpoint itu).
 *
 * @returns {{ captchaId: string, answer: string }}
 */
export function createCaptcha() {
  let answer = '';
  for (let i = 0; i < 4; i++) {
    answer += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  const captchaId = 'cap-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  mockCaptchaStore.set(captchaId, { answer, createdAt: Date.now() });
  return { captchaId, answer };
}

/**
 * Validasi jawaban captcha. Tidak peka huruf besar/kecil.
 * @param {string} captchaId
 * @param {string} answer
 * @returns {boolean}
 * @internal Hanya dipakai di mode mock service (login).
 */
function validateCaptchaMock(captchaId, answer) {
  if (!captchaId || !answer) return false;
  const rec = mockCaptchaStore.get(captchaId);
  if (!rec) return false;
  // Hapus setelah dipakai (one-time).
  mockCaptchaStore.delete(captchaId);
  // Expired: 5 menit
  if (Date.now() - rec.createdAt > 5 * 60 * 1000) return false;
  return String(rec.answer).toLowerCase() === String(answer).trim().toLowerCase();
}

/**
 * Error custom untuk captcha salah → status semantik 422 dengan
 * `errors.captchaAnswer` di kontrak API. Di mock dilempar sebagai Error biasa
 * dengan message yang mudah di-match test / UI.
 */
function captchaError() {
  const err = new Error('Jawaban captcha salah atau sudah kadaluarsa.');
  err.statusCode = 422;
  err.errors = { captchaAnswer: 'Jawaban captcha salah atau sudah kadaluarsa.' };
  return err;
}

/* ========================================================================== */
/*                                 LOGIN                                      */
/* ========================================================================== */

/**
 * Masuk ke akun.
 *
 * Kontrak (sesuai docs/API-CONTRACT.md):
 *   Body: { email, password, captchaId, captchaAnswer }
 *   401 "Email tidak terdaftar" – email tidak ditemukan.
 *   403 "Akun nonaktif, hubungi penanggung jawab" – status bukan AKTIF.
 *   422 errors.captchaAnswer – captcha salah / kadaluarsa.
 *   200 { user } – user bersanitasi (ada email).
 *
 * Mode mock:
 *   - Cari berdasarkan email (case-insensitive).
 *   - Password TIDAK diverifikasi (tanda "MOCK").
 *   - Captcha wajib divalidasi kecuali captchaId === 'MOCK-QUICKLOGIN'
 *     (panel masuk cepat yang diaktifkan UI khusus mode mock).
 * Mode non-mock (stub, TODO(keputusan)):
 *   - Panggil POST /auth/login, pakai Axios, tangani error sesuai kode di atas.
 *   - Captcha: sebelumnya didapat dari GET /auth/captcha (lihat createCaptcha).
 *
 * @param {{ email:string, password:string, captchaId:string, captchaAnswer:string }} payload
 * @returns {Promise<{ user: object }>}
 */
export async function login(payload) {
  const { email, password, captchaId, captchaAnswer } = payload || {};
  void password; // MOCK: password tidak diverifikasi

  if (isMockEnabled()) {
    await delay();

    // Quick login (panel mock) TANPA captcha: captchaId === 'MOCK-QUICKLOGIN'
    if (captchaId !== 'MOCK-QUICKLOGIN') {
      if (!validateCaptchaMock(captchaId, captchaAnswer)) {
        throw captchaError();
      }
    }

    const emailKey = String(email || '')
      .trim()
      .toLowerCase();
    const user = getUsersMock().find(
      (u) => typeof u.email === 'string' && u.email.toLowerCase() === emailKey
    );
    if (!user) {
      const err = new Error('Email tidak terdaftar.');
      err.statusCode = 401;
      throw err;
    }
    if (user.status_akun !== STATUS_AKUN.AKTIF) {
      const err = new Error('Akun nonaktif, hubungi penanggung jawab.');
      err.statusCode = 403;
      throw err;
    }
    return { user: sanitizeUser(user) };
  }

  // NON-MOCK (stub, TODO(keputusan): backend harus memvalidasi captcha
  // berbasis captchaId yang sebelumnya didapat GET /auth/captcha).
  const { data } = await apiClient.post('/auth/login', payload);
  return { user: sanitizeUser(data?.user) };
}

/**
 * Ambil data user saat ini berdasarkan id yang tersimpan di sesi.
 * Berguna untuk memvalidasi sesi (misal user dinonaktifkan setelah login).
 *
 * @param {string} userId
 * @returns {Promise<{ user: object | null }>}
 */
export async function getCurrentUser(userId) {
  if (isMockEnabled()) {
    await delay();
    if (!userId) return { user: null };
    const user = getUsersMock().find((u) => u.id === userId);
    if (!user || user.status_akun !== STATUS_AKUN.AKTIF) return { user: null };
    return { user: sanitizeUser(user) };
  }

  try {
    const { data } = await apiClient.get('/auth/me', {
      params: { id: userId },
    });
    return { user: sanitizeUser(data?.user) };
  } catch {
    return { user: null };
  }
}

/* ========================================================================== */
/*                           register - DIHAPUS                                */
/* ========================================================================== */

// TODO(keputusan): Akun dibuat lewat seed / impor admin backend.
// Tidak ada endpoint /auth/login self-register. Lihat AGENTS.md "Keputusan
// yang masih terbuka" #1 dan docs/API-CONTRACT.md → bagian Keputusan terbuka.
// (void: resolveOrganisasi dipakai sebagai referensi jika kemudian diperlukan
//  fungsi admin buat akun, yang TIDAK sama dengan register mandiri.)
void resolveOrganisasi;
void ROLES;
