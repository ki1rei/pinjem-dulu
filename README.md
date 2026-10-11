\# PinjemDulu



Aplikasi untuk mengelola peminjaman inventaris barang antar-OKI Polinema. Peminjam mengajukan peminjaman secara online, lalu Penanggung Jawab (PJ) Inventaris menyetujui, mencatat kondisi barang, dan mengonfirmasi pengembalian. Pengambilan dan pengembalian barang tetap dilakukan secara fisik.



\## Peran pengguna



\- \*\*Peminjam (`user`)\*\*: melihat dan mencari inventaris, mengecek ketersediaan lewat kalender, mengajukan peminjaman, memantau status, mengajukan pengembalian, dan mengajukan diri sebagai PJ.

\- \*\*Penanggung Jawab Inventaris (`admin`)\*\*: terikat satu OKI. Mengelola inventaris, peminjaman, pengembalian, pengguna, dan request PJ di organisasinya.



\## Struktur repo



```

pinjam-dulu/

├─ FE/    Frontend (Next.js)

├─ BE/    Backend (belum dibuat)

├─ .gitignore

└─ README.md

```



\## Frontend (`FE/`)



\*\*Stack:\*\* Next.js 16 (App Router), React 19, JavaScript, Tailwind CSS v3.4, shadcn/ui, Axios.



\*\*Menjalankan:\*\*



```bash

cd FE

npm install

copy .env.example .env     # macOS/Linux: cp .env.example .env

npm run dev

```



Aplikasi berjalan di http://localhost:3000. Dengan `NEXT\_PUBLIC\_USE\_MOCK=true` di `.env`, FE memakai data mock sehingga backend belum diperlukan.



\*\*Perintah lain\*\* (jalankan dari folder `FE`):



| Perintah | Fungsi |

|---|---|

| `npm run test` | Menjalankan test (`node:test`) |

| `npm run lint` | Memeriksa kode dengan ESLint |

| `npm run build` | Build produksi |



Di PowerShell yang memblokir `npm.ps1`, gunakan `npm.cmd` atau `cmd /c npm ...`.



\## Dokumentasi



\- `FE/docs/API-CONTRACT.md`: kontrak API (draf) antara FE dan BE.

\- `FE/AGENTS.md`: panduan arsitektur, konvensi, dan keputusan proyek untuk FE.



\## Status



\- FE: dalam pengembangan, memakai data mock.

\- BE: belum dimulai. Bentuk data dan endpoint mengacu pada kontrak API di atas.

## 8. Alur kerja harian

Pola yang disarankan:

```
feature/xxx  →  development  →  production
```

- **Mulai fitur baru:**
    
    ```
    git checkout developmentgit pullgit checkout -b feature/task-5e-kuota
    ```
    
- **Selesai:**
    
    ```
    git add -Agit commit -m "feat(FE): verifikasi kuota dan penanda hari"git push -u origin feature/task-5e-kuota
    ```
    
    Lalu buka PR ke `development` di GitHub dan merge.
- **Rilis:** buka PR dari `development` ke `production`, lalu merge setelah test, lint, dan build lolos.

Tips untuk agent: sebelum menjalankan task, selalu commit dulu (titik aman). Tambahkan di AGENTS.md bahwa agent tidak boleh `push`, `checkout`, atau `merge` ke `production`. Cukup commit lokal di branch fitur.