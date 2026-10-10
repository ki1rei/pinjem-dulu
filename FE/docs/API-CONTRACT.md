# Kontrak API — pinjam-dulu (draf 2)

Dokumen ini jembatan antara frontend (mock) dan backend, dan menjadi **sumber kebenaran bentuk data**. Bentuk data mock di frontend harus sama dengan contoh di sini. Skema database: `schema.sql`.

Perubahan dari draf 1: login memakai email + captcha dan register dihapus; aturan tanggal berbasis kuota dengan buffer berbagi hari; field `keperluan` pada jadwal; pemetaan tab UI ke status; label tampilan mengikuti desain.

## Konvensi

- Base URL: `NEXT_PUBLIC_API_URL` (mis. `http://localhost:8000/api`).
- JSON memakai **camelCase**. Backend memetakan dari kolom snake_case database.
- Tanggal: `"YYYY-MM-DD"`. Waktu: ISO-8601 tanpa zona (`"2026-10-07T09:30:00"`, zona Asia/Jakarta).
- Nilai enum dikirim dalam **snake_case**; label tampilan dipetakan di frontend.
- Autentikasi: header `Authorization: Bearer <token>` (mekanisme token ditentukan backend).
- Error: HTTP status sesuai, body `{ "message": "Teks Indonesia", "errors": { "field": "pesan" } }` (`errors` opsional).
- Daftar: `?page=1&limit=10`, respons `{ "data": [...], "meta": { "page": 1, "limit": 10, "total": 42 } }`.
- Respons satu objek: objek langsung, tanpa pembungkus.
- Password tidak pernah dikembalikan.

## Enum

| Enum | Nilai API |
|---|---|
| `role` | `user` (Peminjam), `admin` (Penanggung Jawab OKI) |
| `statusPeminjaman` | `menunggu_persetujuan`, `disetujui`, `ditolak`, `sedang_dipinjam`, `menunggu_pengembalian`, `terlambat`, `selesai` |
| `kondisi` | `baik`, `rusak_ringan`, `rusak_berat` |
| `statusRequest` | `menunggu`, `disetujui`, `ditolak` |

Status yang **menahan barang** (dihitung dalam kuota): `menunggu_persetujuan`, `disetujui`, `sedang_dipinjam`, `menunggu_pengembalian`, `terlambat`. Yang tidak menahan: `ditolak`, `selesai`.

### Label tampilan (dipetakan di frontend, mengikuti desain)

| Nilai API | Label di tab Peminjaman | Label di tab Pengembalian |
|---|---|---|
| `menunggu_persetujuan` | Diajukan | n/a |
| `disetujui` | Disetujui | n/a |
| `ditolak` | Ditolak | n/a |
| `sedang_dipinjam` | Dipinjam | n/a |
| `menunggu_pengembalian` | n/a | Menunggu |
| `selesai` | n/a | Dikembalikan |
| `terlambat` | n/a | Terlambat |

Label desain boleh berbeda dari nama enum. Nilai di API tidak berubah.

### Pemetaan tab UI ke filter `status`

Parameter `status` pada `GET /peminjaman` menerima satu nilai atau beberapa nilai dipisah koma.

| Halaman | Tab | `status` |
|---|---|---|
| Pengajuan Saya > Peminjaman | Diajukan | `menunggu_persetujuan` |
| | Disetujui | `disetujui` |
| | Dipinjam | `sedang_dipinjam` |
| | Ditolak | `ditolak` |
| Pengajuan Saya > Pengembalian | Menunggu | `menunggu_pengembalian` |
| | Dikembalikan | `selesai` |
| | Terlambat | `terlambat` |

`terlambat` berarti barang **belum kembali** dan melewati tenggat. Kolom "Tanggal Dikembalikan" di tab Terlambat harus kosong (`tanggalPengembalian: null`) sampai peminjam mengajukan pengembalian dan PJ mengonfirmasi.

## Aturan bisnis (backend wajib menegakkan, frontend hanya membantu)

1. **H+2:** `startDate >= tanggal pengajuan + 2 hari`. Tidak bisa meminjam di hari H, dan wajib ada 1 hari persiapan.
2. **Hari per peminjaman:** hari pakai = `[startDate, endDate]`; hari persiapan = `startDate − 1`; hari pengecekan (maintenance) = `endDate + 1`. Backend mengisi `bufferStartDate` (`startDate − 1`) dan `bufferEndDate` (`endDate + 1`); frontend tidak mengirimnya. Satu peminjaman minimal memakai 3 hari kalender.
3. **Buffer boleh berbagi hari:** hari pengecekan peminjam A boleh sekaligus menjadi hari persiapan peminjam B. Untuk barang multi-unit, hari buffer suatu peminjaman boleh beririsan dengan hari pakai peminjaman lain selama total kuota terpakai pada hari tersebut tidak melebihi `totalBarang` (pernyataan "buffer tidak boleh jatuh di hari pakai peminjaman lain" adalah AKIBAT rumus kuota untuk barang yang sisa unitnya tidak mencukupi, bukan larangan mutlak terpisah).
4. **Kuota per hari:** `terpakai(d) = Σ jumlahPinjam` booking yang hari pakainya mencakup `d`, ditambah `MAX jumlahPinjam` di antara booking yang `d`-nya hanya hari buffer (buffer tidak dijumlahkan, karena unit yang sama bisa dicek lalu disiapkan ulang di hari yang sama). Pengajuan baru (jumlah `q`, mulai `s`, selesai `e`) valid jika dengan pengajuan itu ikut dihitung, `terpakai(d) <= totalBarang` di **semua** hari pada `[s−1, e+1]`.
5. **Terlambat:** hari pakai booking `terlambat` diperpanjang sampai hari ini, dan hari pengecekannya menjadi hari ini + 1. Status `sedang_dipinjam` yang melewati `endDate` tanpa pengembalian berubah menjadi `terlambat` **otomatis oleh backend** (bukan ditandai manual oleh PJ).
6. **Persetujuan peminjaman:** hanya PJ (`admin`) dari organisasi pemilik inventaris. PJ boleh *melihat* inventaris semua OKI, tetapi hanya *mengubah* inventaris organisasinya.
7. **Persetujuan Request PJ:** oleh PJ (`admin`) yang berorganisasi sama dengan request dan bukan pengaju sendiri. Saat disetujui, pengaju menjadi `admin` dengan `idOrganisasi` request. Tidak ada admin tingkat atas. PJ pertama tiap OKI dibuat lewat seed.
8. **Sedang dipinjam:** transisi `disetujui → sedang_dipinjam` otomatis pada `startDate` (diasumsikan).
9. **Pengembalian lebih awal:** status `menunggu_pengembalian` tetap menahan kuota sampai `bufferEndDate`. Kuota baru lepas setelah PJ mengonfirmasi (`selesai`).
10. **Akun:** `statusAkun = false` tidak bisa login. Akun dibuat lewat seed/impor oleh backend; **tidak ada registrasi mandiri**.
11. **Ajukan pengembalian:** boleh dari status `sedang_dipinjam` maupun `terlambat`.

Contoh untuk satu unit (`totalBarang = 1`) dengan booking aktif 20–30 Okt (buffer 19 dan 31 Okt):
- Peminjam lain yang mengajukan jauh hari paling awal mulai **1 Nov** (31 Okt dipakai bersama sebagai pengecekan A dan persiapan B). Jika mengajukan pada 31 Okt, paling awal **2 Nov** karena H+2.
- Peminjam sebelumnya harus selesai paling lambat **18 Okt** (19 Okt dipakai bersama).

## Alur status peminjaman

```
menunggu_persetujuan → disetujui → sedang_dipinjam → menunggu_pengembalian → selesai
        └→ ditolak                       └→ terlambat ─┘ (lanjut ke menunggu_pengembalian → selesai)
```

## Endpoint

### Auth

Login memakai **email**. NIM tetap ada sebagai data profil. Tidak ada endpoint register.

| Method | Path | Keterangan |
|---|---|---|
| GET | `/auth/captcha` | → `{ "captchaId": "...", "imageUrl": "..." }` *(draf, belum final)* |
| POST | `/auth/login` | body `{ "email", "password", "captchaId", "captchaAnswer" }` → `{ "token": "...", "user": User }` |
| GET | `/auth/me` | → `User` |
| POST | `/auth/logout` | → `204` |

Error login: email tidak ada → `401 "Email tidak terdaftar"`; akun nonaktif → `403 "Akun nonaktif, hubungi penanggung jawab"`; captcha salah atau kedaluwarsa → `422` dengan `errors.captchaAnswer`.

```json
// User
{ "nim": "254107020789", "email": "maitri@example.com", "nama": "Maitri Sakti",
  "idOrganisasi": 1, "namaOrganisasi": "BEM", "role": "user", "statusAkun": true }
```

### Organisasi & Kategori

| Method | Path | Akses |
|---|---|---|
| GET | `/organisasi` | login |
| GET | `/kategori` | login |
| POST | `/kategori` | admin (body `{ "namaKategori" }`, unik) |

```json
// Organisasi
{ "idOrganisasi": 2, "namaOrganisasi": "HMTI", "icon": "/uploads/org/hmti.png" }
// Kategori
{ "idKategori": 1, "namaKategori": "Elektronik" }
```

### Inventaris

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| GET | `/inventaris` | login | query: `search` (nama), `idKategori` (boleh banyak, dipisah koma), `idOrganisasi`, `page`, `limit` |
| GET | `/inventaris/:id` | login | detail |
| POST | `/inventaris` | admin | multipart: field + `thumbnail`; `idOrganisasi` otomatis dari PJ |
| PUT | `/inventaris/:id` | admin (OKI sendiri) | multipart |
| DELETE | `/inventaris/:id` | admin (OKI sendiri) | `409` bila masih punya peminjaman yang menahan barang |
| GET | `/inventaris/:id/peminjaman-aktif` | login | booking yang menahan barang (bahan kalender dan daftar jadwal), **tanpa data pribadi** |

Filter kategori di katalog bersifat multi-pilih (desain). Filter OKI menyusul dengan pola yang sama.

```json
// Inventaris
{ "idInventaris": 7, "idKategori": 1, "namaKategori": "Elektronik",
  "idOrganisasi": 2, "namaOrganisasi": "HMTI",
  "namaBarang": "Proyektor Epson", "lokasi": "Sekretariat Lt. 2",
  "totalBarang": 4, "sisaHariIni": 2, "kondisi": "baik",
  "deskripsiBarang": "Resolusi 1280 x 800, 3.600 lumens, HDMI dan VGA",
  "thumbnail": "/uploads/inventaris/proyektor.jpg" }

// GET /inventaris/:id/peminjaman-aktif  → array
[ { "startDate": "2026-09-20", "endDate": "2026-09-22",
    "bufferStartDate": "2026-09-19", "bufferEndDate": "2026-09-23",
    "jumlahPinjam": 2, "status": "sedang_dipinjam",
    "keperluan": "Seminar BEM", "namaOrganisasi": "BEM" } ]
```

Catatan:
- `sisaHariIni` hanya informasi (tampil sebagai "2 dari 4"). Ketersediaan sebenarnya selalu per tanggal.
- Badge "Tersedia" di desain diturunkan dari `sisaHariIni > 0`; tidak ada kolom `status_barang` di database.
- `peminjaman-aktif` menambah `keperluan` dan `namaOrganisasi` (organisasi peminjam) untuk daftar jadwal di halaman detail. Keduanya bukan data pribadi. *(draf, perlu dikonfirmasi tim BE)*

### Peminjaman

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | `/peminjaman` | user | ajukan |
| GET | `/peminjaman` | login | user: miliknya; admin: untuk inventaris OKI-nya. Query: `status` (satu atau beberapa, dipisah koma), `search` (nama barang), `page`, `limit` |
| GET | `/peminjaman/:id` | pemilik atau PJ terkait | detail |
| PATCH | `/peminjaman/:id/setujui` | admin | body `{ "kondisiSebelum", "deskripsiSebelum" }` |
| PATCH | `/peminjaman/:id/tolak` | admin | body `{ "alasanPenolakan" }` (wajib) |
| PATCH | `/peminjaman/:id/ajukan-pengembalian` | user (pemilik) | dari `sedang_dipinjam` atau `terlambat` → `menunggu_pengembalian` |
| PATCH | `/peminjaman/:id/konfirmasi-pengembalian` | admin | body `{ "tanggalPengembalian", "kondisiSesudah", "deskripsiSesudah", "sanksi" }` → `selesai`; kondisi dan deskripsi di inventaris ikut diperbarui |

```json
// POST /peminjaman  (body)
{ "idInventaris": 7, "startDate": "2026-10-20", "endDate": "2026-10-25",
  "jumlahPinjam": 1, "keperluan": "Seminar HMTI" }

// Peminjaman (respons)
{ "idPeminjaman": 15,
  "pengguna": { "nim": "254107020789", "nama": "Maitri Sakti" },
  "inventaris": { "idInventaris": 7, "namaBarang": "Proyektor Epson", "namaOrganisasi": "HMTI",
                  "thumbnail": "/uploads/inventaris/proyektor.jpg" },
  "tanggalPengajuan": "2026-10-17T09:30:00",
  "startDate": "2026-10-20", "endDate": "2026-10-25",
  "bufferStartDate": "2026-10-19", "bufferEndDate": "2026-10-26",
  "tanggalPengembalian": null, "status": "menunggu_persetujuan",
  "alasanPenolakan": null, "keperluan": "Seminar HMTI", "jumlahPinjam": 1,
  "kondisiSebelum": null, "deskripsiSebelum": null,
  "kondisiSesudah": null, "deskripsiSesudah": null, "sanksi": null }
```

Error validasi pengajuan: `422` dengan `errors` (mis. `startDate: "Tanggal mulai paling awal 2026-10-09"`, `jumlahPinjam: "Sisa barang pada 2026-10-22 hanya 1"`).

### Request PJ

Di UI peminjam halaman ini bernama "Pengajuan PJ" (tab Menunggu, Disetujui, Ditolak).

| Method | Path | Akses |
|---|---|---|
| POST | `/request-pj` | user: multipart `idOrganisasi`, `jabatan`, `lampiranApproval` (file) |
| GET | `/request-pj` | user: miliknya; admin: request ke OKI-nya. Query `status`, `page`, `limit` |
| PATCH | `/request-pj/:id/setujui` | admin (OKI sama, bukan pengaju) |
| PATCH | `/request-pj/:id/tolak` | admin (OKI sama): body `{ "alasanPenolakan" }` |

```json
{ "idRequest": 3, "pengguna": { "nim": "254107020789", "nama": "Maitri Sakti" },
  "idOrganisasi": 2, "namaOrganisasi": "HMTI", "jabatan": "Ketua Divisi Perlengkapan",
  "lampiranApproval": "/uploads/request/surat-3.pdf", "status": "menunggu",
  "tanggalRequest": "2026-10-07", "alasanPenolakan": null }
```

### Pengguna (admin)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/users` | **hanya pengguna di organisasi PJ** (diputuskan); query `search`, `page`, `limit` |
| PATCH | `/users/:nim/status` | body `{ "statusAkun": true/false }` |
| PATCH | `/users/:nim/role` | body `{ "role": "user" }` atau `"admin"` (admin hanya untuk organisasi PJ itu) |

### Dashboard & Laporan *(draf, desain belum ada)*

| Method | Path | Respons |
|---|---|---|
| GET | `/dashboard/peminjam` | `{ "ringkasan": { "diajukan": 1, "sedangDipinjam": 1, "selesai": 4 }, "pengajuanBerjalan": [Peminjaman], "sedangBerlangsung": [Peminjaman] }` |
| GET | `/dashboard/pj` | `{ "ringkasanInventaris": { "jenisBarang": 12, "totalUnit": 48 }, "perluDiproses": [Peminjaman], "peminjaman": [Peminjaman], "menungguPengembalian": [Peminjaman] }` |
| GET | `/laporan/inventaris` | daftar inventaris OKI PJ + jumlah sedang dipinjam; opsional `?format=csv` |

Riwayat peminjam dilayani tab "Dikembalikan" (`GET /peminjaman?status=selesai`), tidak ada halaman riwayat terpisah. Menu Laporan belum ada di desain sidebar PJ.

## Keputusan terbuka (belum final)

1. **Kondisi per baris vs barang jamak:** `inventaris.kondisi` hanya satu nilai per baris. Jika dari 3 unit hanya 1 yang rusak, tidak terwakili. Opsi: (a) pecah menjadi baris terpisah, (b) tambah kolom `jumlahRusak`.
2. **`sedang_dipinjam`:** otomatis pada `startDate` (diasumsikan), atau PJ menandai serah-terima.
3. **Pengembalian lebih awal:** draf ini tetap terkunci sampai `bufferEndDate`. Alternatif: field `tanggalKembaliSebenarnya` untuk melepas kuota lebih awal.
4. **Batas durasi** pinjam dan **batas maksimal hari ke depan** (kebijakan OKI).
5. **Captcha:** `GET /auth/captcha` masih draf; backend yang menerbitkan dan memvalidasi.
6. **Mekanisme token/session** dan **penyimpanan file** (gambar barang, surat persetujuan): ditentukan backend.
7. **Menu Laporan** untuk PJ: belum ada di desain.
8. **`keperluan` dan `namaOrganisasi` di `peminjaman-aktif`:** perlu konfirmasi apakah boleh dibuka ke semua pengguna login.

## Keputusan yang sudah final

- Barang berjumlah banyak didukung (`totalBarang`, `jumlahPinjam`, input Jumlah Unit di form).
- Tidak ada admin tingkat atas. Request PJ disetujui PJ lain di organisasi yang sama; PJ pertama lewat seed.
- Status Terlambat otomatis. `/users` hanya organisasi PJ.
- Login email + kata sandi + captcha; register dihapus; akun dari seed/impor.
- Sanksi berupa teks bebas (`VARCHAR(255)`).
- `tanggal_pengajuan` bertipe `TIMESTAMP`; `buffer_start_date` dan `buffer_end_date` adalah kolom generated.
