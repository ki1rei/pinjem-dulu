-- 0. ENUM TYPES
CREATE TYPE rol_usr_enum AS ENUM ('Peminjam', 'Pengelola');
CREATE TYPE knd_brg_enum AS ENUM ('Baik', 'Rusak');
CREATE TYPE sts_pjm_enum AS ENUM (
    'Diajukan',
    'Disetujui',
    'Ditolak',
    'Dipinjam',
    'Dikembalikan',
    'Terlambat'
);
CREATE TYPE sts_req_enum AS ENUM ('Diajukan', 'Disetujui', 'Ditolak');

-- 1. ORGANISASI (dibuat lebih dulu karena dirujuk pgn)
CREATE TABLE org (
    id_org SERIAL PRIMARY KEY,
    nma_org VARCHAR(100) NOT NULL,
    ico_org BYTEA
);

-- 2. PENGGUNA
CREATE TABLE pgn (
    nim VARCHAR(15) PRIMARY KEY,
    id_org INTEGER,
    nma_pgn VARCHAR(100) NOT NULL,
    pwd_pgn VARCHAR(255) NOT NULL,
    rol_pgn rol_usr_enum NOT NULL,
    sts_akn BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_pgn_org
        FOREIGN KEY (id_org) REFERENCES org (id_org)
);

-- 3. KATEGORI
CREATE TABLE kat (
    id_kat SERIAL PRIMARY KEY,
    nma_kat VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX uq_kat_nma
    ON kat (LOWER(TRIM(nma_kat)));

-- 4. INVENTARIS
CREATE TABLE inv (
    id_inv SERIAL PRIMARY KEY,
    id_kat INTEGER NOT NULL,
    id_org INTEGER NOT NULL,
    nma_inv VARCHAR(100) NOT NULL,
    tot_inv INTEGER NOT NULL,
    knd_inv knd_brg_enum NOT NULL,
    dsk_inv VARCHAR(255),
    thm_inv BYTEA,
    CONSTRAINT fk_inv_kat
        FOREIGN KEY (id_kat) REFERENCES kat (id_kat),
    CONSTRAINT fk_inv_org
        FOREIGN KEY (id_org) REFERENCES org (id_org),
    CONSTRAINT chk_tot_inv
        CHECK (tot_inv >= 0)
);

-- 5. PEMINJAMAN
CREATE TABLE pjm (
    id_pjm SERIAL PRIMARY KEY,
    nim VARCHAR(15) NOT NULL,
    id_inv INTEGER NOT NULL,
    tgl_aju DATE NOT NULL DEFAULT CURRENT_DATE,
    tgl_mul DATE NOT NULL,          -- = start_date
    tgl_akh DATE NOT NULL,          -- = end_date

    -- Generated columns: jangan diisi manual pada INSERT/UPDATE.
    tgl_bmul DATE GENERATED ALWAYS AS (tgl_mul - 1) STORED,  -- = tanggal_mulai
    tgl_bakh DATE GENERATED ALWAYS AS (tgl_akh + 2) STORED,  -- = tanggal_selesai

    tgl_kmb DATE,                   -- = tanggal_pengembalian
    sts_pjm sts_pjm_enum NOT NULL DEFAULT 'Diajukan',
    als_tlk VARCHAR(255),
    kpr_pjm VARCHAR(255) NOT NULL,
    knd_awl knd_brg_enum,
    knd_akh knd_brg_enum,
    snk_pjm VARCHAR(255),
    jml_pjm INTEGER NOT NULL,
    CONSTRAINT fk_pjm_pgn
        FOREIGN KEY (nim) REFERENCES pgn (nim),
    CONSTRAINT fk_pjm_inv
        FOREIGN KEY (id_inv) REFERENCES inv (id_inv),
    CONSTRAINT chk_jml_pjm
        CHECK (jml_pjm > 0),
    CONSTRAINT chk_tgl_pjm
        CHECK (tgl_akh >= tgl_mul),
    CONSTRAINT chk_als_tlk_pjm
        CHECK (sts_pjm <> 'Ditolak' OR als_tlk IS NOT NULL)
);

-- 6. REQUEST PJ
CREATE TABLE req (
    id_req SERIAL PRIMARY KEY,
    id_org INTEGER NOT NULL,
    nim VARCHAR(15) NOT NULL,
    lmp_app BYTEA NOT NULL,
    sts_req sts_req_enum NOT NULL DEFAULT 'Diajukan',
    tgl_req DATE NOT NULL DEFAULT CURRENT_DATE,
    als_tlk VARCHAR(255),
    CONSTRAINT fk_req_org
        FOREIGN KEY (id_org) REFERENCES org (id_org),
    CONSTRAINT fk_req_pgn
        FOREIGN KEY (nim) REFERENCES pgn (nim),
    CONSTRAINT chk_als_tlk_req
        CHECK (sts_req <> 'Ditolak' OR als_tlk IS NOT NULL)
);

-- 7. LOGIKA 1: catat kondisi barang saat peminjaman disetujui
CREATE OR REPLACE FUNCTION fn_catat_knd_awl()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_knd knd_brg_enum;
BEGIN
    IF OLD.sts_pjm = 'Diajukan' AND NEW.sts_pjm = 'Disetujui' THEN
        SELECT i.knd_inv
          INTO v_knd
          FROM inv AS i
         WHERE i.id_inv = NEW.id_inv
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Data inventaris tidak ditemukan.';
        END IF;

        IF v_knd = 'Rusak' THEN
            RAISE EXCEPTION
                'Peminjaman tidak dapat disetujui karena barang dalam kondisi Rusak.';
        END IF;

        NEW.knd_awl := v_knd;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_catat_knd_awl
BEFORE UPDATE OF sts_pjm ON pjm
FOR EACH ROW
EXECUTE FUNCTION fn_catat_knd_awl();

-- 8. LOGIKA 2: perbarui inventaris setelah pengembalian
CREATE OR REPLACE FUNCTION fn_perbarui_inv_kmb()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.sts_pjm IS DISTINCT FROM NEW.sts_pjm
       AND NEW.sts_pjm = 'Dikembalikan' THEN

        IF NEW.tgl_kmb IS NULL THEN
            RAISE EXCEPTION
                'Tanggal pengembalian harus diisi sebelum peminjaman diselesaikan.';
        END IF;

        IF NEW.knd_akh IS NULL THEN
            RAISE EXCEPTION
                'Kondisi barang setelah pengembalian harus diisi.';
        END IF;

        IF NEW.knd_akh = 'Rusak' THEN
            UPDATE inv
               SET knd_inv = 'Rusak'
             WHERE id_inv = NEW.id_inv;
        END IF;
        -- Bila knd_akh = 'Baik', tidak ada UPDATE ke tabel inv.
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_perbarui_inv_kmb
AFTER UPDATE OF sts_pjm ON pjm
FOR EACH ROW
EXECUTE FUNCTION fn_perbarui_inv_kmb();

SELECT * FROM org;
SELECT * FROM kat;
SELECT * FROM pgn;
SELECT * FROM inv;
SELECT * FROM pjm;
SELECT * FROM req;
