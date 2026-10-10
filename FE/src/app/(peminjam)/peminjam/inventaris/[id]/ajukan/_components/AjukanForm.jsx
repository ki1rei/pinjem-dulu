'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import RangeDatePicker from '@/components/Common/RangeDatePicker.jsx';

import { createPeminjaman } from '@/lib/api/peminjaman.js';
import { validatePengajuanForm, MAX_KEPERLUAN_LENGTH } from '@/lib/peminjaman-validation.js';
import { isRangeStillValid, getMaxUnitsForRange } from '@/lib/date-rules.js';

import AjukanReadonlyFields from './AjukanReadonlyFields.jsx';
import AjukanUnitField from './AjukanUnitField.jsx';
import AjukanDialogs from './AjukanDialogs.jsx';

/**
 * Komponen formulir pengajuan peminjaman barang inventaris.
 */
export default function AjukanForm({
  user,
  inventaris,
  jadwal = [],
  jadwalDisabled = false,
  today,
  hrefDetail,
  hrefKatalog,
}) {
  const router = useRouter();

  // Form State
  const [jumlahPinjam, setJumlahPinjam] = React.useState(1);
  const [dates, setDates] = React.useState({ startDate: null, endDate: null });
  const [keperluan, setKeperluan] = React.useState('');

  // UI & Validation State
  const [errors, setErrors] = React.useState({});
  const [generalError, setGeneralError] = React.useState(null);
  const [resetNote, setResetNote] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Dialog State
  const [openKirim, setOpenKirim] = React.useState(false);
  const [openSukses, setOpenSukses] = React.useState(false);
  const [openBatal, setOpenBatal] = React.useState(false);

  // DOM Refs untuk fokus saat validasi gagal
  const unitInputRef = React.useRef(null);
  const dateContainerRef = React.useRef(null);
  const keperluanRef = React.useRef(null);

  // Apakah form sudah diisi / dimodifikasi dari nilai awal
  const isDirty =
    jumlahPinjam !== 1 ||
    Boolean(dates?.startDate) ||
    Boolean(dates?.endDate) ||
    keperluan.trim() !== '';

  const hasDateRange = Boolean(dates?.startDate && dates?.endDate);
  const availableUnitsOnDate = React.useMemo(() => {
    if (!dates?.startDate || !dates?.endDate) return null;
    return getMaxUnitsForRange(dates.startDate, dates.endDate, {
      bookings: jadwal,
      totalBarang: inventaris?.totalBarang || 1,
      today,
    });
  }, [dates.startDate, dates.endDate, jadwal, inventaris?.totalBarang, today]);

  const handleJumlahChange = (val) => {
    const newQty = Number(val) || 1;
    setJumlahPinjam(val);
    if (errors.jumlahPinjam) {
      setErrors((prev) => ({ ...prev, jumlahPinjam: null }));
    }

    if (dates?.startDate && dates?.endDate) {
      const stillValid = isRangeStillValid(dates, {
        bookings: jadwal,
        totalBarang: inventaris?.totalBarang,
        jumlahPinjam: newQty,
        today,
      });

      if (!stillValid) {
        setDates({ startDate: null, endDate: null });
        setResetNote('Tanggal direset karena jumlah unit berubah');
      }
    }
  };

  const handleDatesChange = React.useCallback(
    (val) => {
      const nextDates = val || { startDate: null, endDate: null };
      setDates(nextDates);
      setResetNote(null);
      setErrors((prev) => {
        if (prev.startDate || prev.endDate || prev.tanggal) {
          return {
            ...prev,
            startDate: null,
            endDate: null,
            tanggal: null,
          };
        }
        return prev;
      });

      if (nextDates.startDate && nextDates.endDate) {
        const maxUnits = getMaxUnitsForRange(nextDates.startDate, nextDates.endDate, {
          bookings: jadwal,
          totalBarang: inventaris?.totalBarang || 1,
          today,
        });
        const currentQty = Number(jumlahPinjam) || 1;
        if (currentQty > maxUnits) {
          setJumlahPinjam(maxUnits);
          setResetNote(
            `Jumlah unit disesuaikan menjadi ${maxUnits} unit mengikuti ketersediaan tanggal.`
          );
        }
      }
    },
    [jadwal, inventaris?.totalBarang, today, jumlahPinjam]
  );

  const handleKeperluanChange = (e) => {
    setKeperluan(e.target.value);
    if (errors.keperluan) {
      setErrors((prev) => ({ ...prev, keperluan: null }));
    }
  };

  // Fokus ke field pertama yang mengalami error
  const focusFirstError = (errObj) => {
    if (errObj.jumlahPinjam && unitInputRef.current) {
      unitInputRef.current.focus();
    } else if ((errObj.startDate || errObj.endDate || errObj.tanggal) && dateContainerRef.current) {
      const firstTrigger = dateContainerRef.current.querySelector('button[role="combobox"]');
      if (firstTrigger) firstTrigger.focus();
    } else if (errObj.keperluan && keperluanRef.current) {
      keperluanRef.current.focus();
    }
  };

  // Validasi dan buka dialog konfirmasi kirim
  const handleSubmitClick = (e) => {
    e.preventDefault();
    setGeneralError(null);

    const validation = validatePengajuanForm({
      jumlahPinjam,
      startDate: dates?.startDate,
      endDate: dates?.endDate,
      keperluan,
      totalBarang: inventaris?.totalBarang,
      bookings: jadwal,
      today,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      focusFirstError(validation.errors);
      return;
    }

    setErrors({});
    setOpenKirim(true);
  };

  // Konfirmasi kirim di dalam dialog
  const handleConfirmKirim = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      await createPeminjaman({
        idInventaris: inventaris.idInventaris,
        startDate: dates.startDate,
        endDate: dates.endDate,
        jumlahPinjam: Number(jumlahPinjam),
        keperluan: keperluan.trim(),
      });

      setIsSubmitting(false);
      setOpenKirim(false);
      setOpenSukses(true);
    } catch (err) {
      setIsSubmitting(false);
      setOpenKirim(false);

      const serverErrors = err?.errors || err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
        focusFirstError(serverErrors);
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Terjadi kesalahan saat mengirim pengajuan.';
        setGeneralError(msg);
      }
    }
  };

  // Aksi tombol Batal di form
  const handleBatalClick = () => {
    if (!isDirty) {
      router.push(hrefDetail);
    } else {
      setOpenBatal(true);
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <CardContent className="p-0">
          <form onSubmit={handleSubmitClick} noValidate className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Pengajuan Peminjaman
            </h1>

            {/* Field Hanya-baca */}
            <AjukanReadonlyFields user={user} inventaris={inventaris} />

            {/* Jumlah Unit */}
            <AjukanUnitField
              ref={unitInputRef}
              value={jumlahPinjam}
              onChange={handleJumlahChange}
              totalBarang={inventaris?.totalBarang || 1}
              availableUnits={availableUnitsOnDate}
              hasDateRange={hasDateRange}
              error={errors.jumlahPinjam}
            />

            {/* Tanggal Peminjaman & Pengembalian */}
            <div ref={dateContainerRef} className="space-y-1.5">
              <RangeDatePicker
                value={dates}
                onChange={handleDatesChange}
                bookings={jadwal}
                totalBarang={inventaris?.totalBarang || 1}
                jumlahPinjam={Number(jumlahPinjam) || 1}
                today={today}
                disabled={jadwalDisabled}
                error={Boolean(errors.startDate || errors.endDate || errors.tanggal)}
              />

              {resetNote && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {resetNote}
                </p>
              )}

              {(errors.startDate || errors.endDate || errors.tanggal) && (
                <p className="text-xs text-destructive font-medium">
                  {errors.startDate || errors.endDate || errors.tanggal}
                </p>
              )}
            </div>

            {/* Keperluan Peminjaman */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="field-keperluan" className="text-sm font-medium text-foreground">
                  Keperluan Peminjaman Barang
                </Label>
                <span className="text-xs text-muted-foreground">
                  {keperluan.length}/{MAX_KEPERLUAN_LENGTH}
                </span>
              </div>
              <Textarea
                ref={keperluanRef}
                id="field-keperluan"
                placeholder="Contoh : Kebutuhan Seminar Kaderisasi OKI"
                value={keperluan}
                onChange={handleKeperluanChange}
                maxLength={MAX_KEPERLUAN_LENGTH}
                rows={3}
                aria-invalid={Boolean(errors.keperluan)}
                aria-describedby={errors.keperluan ? 'field-keperluan-error' : undefined}
                className="resize-none"
              />
              {errors.keperluan && (
                <p id="field-keperluan-error" className="text-xs text-destructive font-medium">
                  {errors.keperluan}
                </p>
              )}
            </div>

            {/* Pesan Error Umum */}
            {generalError && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBatalClick}
                className="h-11 px-6 rounded-xl border-border text-foreground hover:bg-muted font-medium transition-colors"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm transition-colors"
              >
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tiga Dialog Konfirmasi */}
      <AjukanDialogs
        openKirim={openKirim}
        onOpenKirimChange={setOpenKirim}
        onConfirmKirim={handleConfirmKirim}
        isSubmitting={isSubmitting}
        openSukses={openSukses}
        onOpenSuksesChange={setOpenSukses}
        onKembaliSukses={() => router.push(hrefKatalog)}
        openBatal={openBatal}
        onOpenBatalChange={setOpenBatal}
        onConfirmBatal={() => router.push(hrefDetail)}
      />
    </>
  );
}
