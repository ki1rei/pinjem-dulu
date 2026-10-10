# PinjemDulu

Frontend aplikasi peminjaman inventaris organisasi mahasiswa (OKI). Backend dikerjakan terpisah; saat ini UI memakai data mock bila `NEXT_PUBLIC_USE_MOCK=true`.

Tagline: **INVENTARIS OKI KAMPUS**.

## Stack

- Next.js 16 (App Router) + React 19
- JavaScript (bukan TypeScript)
- Tailwind CSS, Axios, next-themes
- ESLint + Prettier

## Menjalankan

```bash
npm i
cp .env.example .env
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Perintah lain: `npm run lint`, `npm run build`.

## Variabel lingkungan

- `NEXT_PUBLIC_API_URL` — URL API backend (contoh: `http://localhost:8000/api`)
- `NEXT_PUBLIC_USE_MOCK` — `true` untuk memakai data contoh di `src/data/mock/`

## Struktur folder

```
public/                 # Aset statis (favicon masih placeholder)
src/
  app/                  # App Router: (root), (auth), (peminjam), (pj)
  components/
    Common/             # UI atomik
    Mixins/             # Navbar, Footer, Sidebar, DashboardShell
  context/              # AuthContext
  data/                 # siteMetadata + mock
  hooks/                # Custom hooks
  lib/                  # constants, date-rules, api/*
  providers/            # ThemeProvider
```

## Konvensi

- Alias import: `@/` mengarah ke `src/`.
- Teks UI dan metadata berbahasa Indonesia (`lang="id"`).
- UI kecil → `components/Common`. Blok besar → `components/Mixins`.
- Halaman terlindungi: `(peminjam)` untuk peminjam, `(pj)` untuk penanggung jawab.
- Service API ada di `src/lib/api/`; cabangkan mock vs Axios di tiap fungsi.
- Favicon di `src/app/favicon.ico` dan `public/favicon.ico` masih bawaan dan perlu diganti.
