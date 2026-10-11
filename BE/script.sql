-- 1. ENUM TIPE
CREATE TYPE rol_usr_enum AS ENUM ('peminjam', 'penanggung_jawab');
CREATE TYPE knd_brg_enum AS ENUM ('baik', 'rusak_ringan', 'rusak_berat');
CREATE TYPE sts_brg_enum AS ENUM ('tersedia', 'dipinjam', 'dalam_perbaikan');
CREATE TYPE sts_pjm_enum AS ENUM ('menunggu_persetujuan', 'disetujui', 'ditolak', 'sedang_dipinjam', 'selesai');
CREATE TYPE sts_req_enum AS ENUM ('menunggu', 'disetujui', 'ditolak');

-- 2. TABEL ORGANISASI (org)
CREATE TABLE org (
    id_org SERIAL PRIMARY KEY,
    nma_org VARCHAR(100) NOT NULL,
    ico_org VARCHAR(255) NOT NULL
);

-- 3. TABEL PENGGUNA (pgn)
CREATE TABLE pgn (
    nim VARCHAR(15) PRIMARY KEY,
    id_org INT REFERENCES org(id_org) ON DELETE SET NULL,
    nma_pgn VARCHAR(100) NOT NULL,
    pwd_pgn VARCHAR(255) NOT NULL,
    rol_pgn rol_usr_enum NOT NULL,
    sts_akn BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. TABEL KATEGORI (kat)
CREATE TABLE kat (
    id_kat SERIAL PRIMARY KEY,
    nma_kat VARCHAR(50) NOT NULL UNIQUE
);

-- 5. TABEL INVENTARIS (inv)
CREATE TABLE inv (
    id_inv SERIAL PRIMARY KEY,
    id_kat INT NOT NULL REFERENCES kat(id_kat) ON DELETE RESTRICT,
    id_org INT NOT NULL REFERENCES org(id_org) ON DELETE CASCADE,
    nma_inv VARCHAR(100) NOT NULL,
    tot_inv INT NOT NULL CHECK (tot_inv >= 0),
    knd_inv knd_brg_enum NOT NULL,
    dsk_inv VARCHAR(255) NOT NULL,
    thm_inv VARCHAR(255) NOT NULL,
    sts_inv sts_brg_enum NOT NULL DEFAULT 'tersedia'
);

-- 6. TABEL PEMINJAMAN (pjm)
CREATE TABLE pjm (
    id_pjm SERIAL PRIMARY KEY,
    nim VARCHAR(15) NOT NULL REFERENCES pgn(nim) ON DELETE CASCADE,
    id_inv INT NOT NULL REFERENCES inv(id_inv) ON DELETE CASCADE,
    tgl_aju DATE NOT NULL DEFAULT CURRENT_DATE,
    tgl_mul DATE NOT NULL,
    tgl_akh DATE NOT NULL,
    tgl_kmb DATE,
    sts_pjm sts_pjm_enum NOT NULL DEFAULT 'menunggu_persetujuan',
    als_tlk VARCHAR(255),
    kpr_pjm VARCHAR(255) NOT NULL,
    knd_awl knd_brg_enum NOT NULL,
    dsk_awl VARCHAR(255),
    knd_akh knd_brg_enum,
    dsk_akh VARCHAR(255),
    snk_pjm VARCHAR(255),
    jml_pjm INT NOT NULL CHECK (jml_pjm > 0),
    CHECK (tgl_akh >= tgl_mul)
);

-- 7. TABEL REQUEST_PJ (req)
CREATE TABLE req (
    id_req SERIAL PRIMARY KEY,
    id_org INT NOT NULL REFERENCES org(id_org) ON DELETE CASCADE,
    nim VARCHAR(15) NOT NULL REFERENCES pgn(nim) ON DELETE CASCADE,
    lmp_app VARCHAR(255) NOT NULL,
    sts_req sts_req_enum NOT NULL DEFAULT 'menunggu',
    tgl_req DATE NOT NULL DEFAULT CURRENT_DATE,
    als_tlk VARCHAR(255)
);