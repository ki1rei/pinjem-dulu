-- 1. Fungsi hitung stok tersedia pada rentang tanggal tertentu
CREATE OR REPLACE FUNCTION fn_jml_tersedia(
    p_id_inv  INTEGER,
    p_tgl_mul DATE,
    p_tgl_akh DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_tot    INTEGER;
    v_knd    knd_brg_enum;
    v_dipakai INTEGER;
BEGIN
    IF p_tgl_mul IS NULL OR p_tgl_akh IS NULL OR p_tgl_akh < p_tgl_mul THEN
        RAISE EXCEPTION 'Rentang tanggal peminjaman tidak valid.';
    END IF;

    SELECT i.tot_inv, i.knd_inv
      INTO v_tot, v_knd
      FROM inv AS i
     WHERE i.id_inv = p_id_inv;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventaris dengan ID % tidak ditemukan.', p_id_inv;
    END IF;

    IF v_knd = 'Rusak' THEN
        RETURN 0;
    END IF;

    SELECT COALESCE(SUM(p.jml_pjm), 0)::INTEGER
      INTO v_dipakai
      FROM pjm AS p
     WHERE p.id_inv = p_id_inv
       AND (
           (
               p.sts_pjm = 'Disetujui'
               AND p.tgl_bmul <= (p_tgl_akh + 2)
               AND p.tgl_bakh >= (p_tgl_mul - 1)
           )
           OR
           (
               p.sts_pjm IN ('Dipinjam', 'Terlambat')
               AND p.tgl_kmb IS NULL
           )
       );

    RETURN GREATEST(v_tot - v_dipakai, 0);
END;
$$;

-- 2. Logika 1 versi final: sekarang ikut memeriksa stok
--    (menggantikan isi fn_catat_knd_awl; trigger trg_catat_knd_awl tidak perlu dibuat ulang)
CREATE OR REPLACE FUNCTION fn_catat_knd_awl()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_knd      knd_brg_enum;
    v_tersedia INTEGER;
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

        v_tersedia := fn_jml_tersedia(NEW.id_inv, NEW.tgl_mul, NEW.tgl_akh);

        IF v_tersedia < NEW.jml_pjm THEN
            RAISE EXCEPTION
                'Stok tidak mencukupi. Tersedia: %, diminta: %.',
                v_tersedia, NEW.jml_pjm;
        END IF;

        NEW.knd_awl := v_knd;
    END IF;

    RETURN NEW;
END;
$$;

-- 3. View riwayat peminjaman
CREATE OR REPLACE VIEW v_riw_pjm AS
SELECT
    p.id_pjm,
    p.tgl_aju,
    u.nim,
    u.nma_pgn,
    op.nma_org AS nma_org_pjm,       -- organisasi peminjam
    i.id_inv,
    i.nma_inv,
    ob.nma_org AS nma_org_inv,       -- organisasi pemilik barang
    p.jml_pjm,
    p.tgl_mul,
    p.tgl_akh,
    p.tgl_bmul,
    p.tgl_bakh,
    p.tgl_kmb,
    p.sts_pjm,
    p.kpr_pjm,
    p.knd_awl,
    p.knd_akh,
    p.als_tlk,
    p.snk_pjm
FROM pjm AS p
JOIN pgn AS u
  ON u.nim = p.nim
LEFT JOIN org AS op
  ON op.id_org = u.id_org
JOIN inv AS i
  ON i.id_inv = p.id_inv
JOIN org AS ob
  ON ob.id_org = i.id_org;

-- 4. View ringkasan inventaris + stok tersedia saat ini
CREATE OR REPLACE VIEW v_inv_ringkas AS
SELECT
    i.id_inv,
    i.nma_inv,
    k.nma_kat,
    o.nma_org,
    i.tot_inv,
    i.knd_inv,
    x.jml_dipakai,
    CASE
        WHEN i.knd_inv = 'Rusak' THEN 0
        ELSE GREATEST(i.tot_inv - x.jml_dipakai, 0)
    END AS jml_tersedia
FROM inv AS i
JOIN kat AS k
  ON k.id_kat = i.id_kat
JOIN org AS o
  ON o.id_org = i.id_org
CROSS JOIN LATERAL (
    SELECT COALESCE(SUM(p.jml_pjm), 0)::INTEGER AS jml_dipakai
    FROM pjm AS p
    WHERE p.id_inv = i.id_inv
      AND (
          (
              p.sts_pjm = 'Disetujui'
              AND p.tgl_bmul <= CURRENT_DATE
              AND p.tgl_bakh >= CURRENT_DATE
          )
          OR
          (
              p.sts_pjm IN ('Dipinjam', 'Terlambat')
              AND p.tgl_kmb IS NULL
          )
      )
) AS x;

-- 5. Materialized view jumlah peminjaman per status
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_rkp_sts_pjm AS
SELECT
    d.sts_pjm,
    COUNT(p.id_pjm)::BIGINT AS jml_data
FROM unnest(enum_range(NULL::sts_pjm_enum)) AS d(sts_pjm)
LEFT JOIN pjm AS p
  ON p.sts_pjm = d.sts_pjm
GROUP BY d.sts_pjm;
