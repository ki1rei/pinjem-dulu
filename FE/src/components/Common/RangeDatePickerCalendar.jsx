'use client';

import * as React from 'react';
import { id as idLocale } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { formatTanggal, dateToISO, isoToDate } from '@/lib/format.js';
import { getEarliestStartDate } from '@/lib/date-rules.js';

function addDaysLocal(date, n) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Panel kalender dan aksi untuk RangeDatePicker Popover.
 *
 * @param {object} props
 * @param {{ start: string|null, end: string|null }} props.draft
 * @param {'start'|'end'|'done'} props.phase
 * @param {'start'|'end'|null} [props.openedFrom]
 * @param {string|number|null} [props.maxEndDate]
 * @param {string} props.activeToday
 * @param {Date} props.currentMonth
 * @param {(month: Date) => void} props.onMonthChange
 * @param {(day: Date) => void} props.onDayClick
 * @param {(day: Date) => boolean} props.isDayDisabled
 * @param {object} props.modifiers
 * @param {boolean} props.isComplete
 * @param {{ from?: Date|null, to?: Date|null }} props.selected
 * @param {(date: Date) => object} props.dayStatus
 * @param {number} [props.jumlahPinjam]
 * @param {() => void} props.onCancel
 * @param {() => void} props.onApply
 */
export function RangeDatePickerCalendar({
  draft,
  openedFrom,
  maxEndDate,
  activeToday,
  jumlahPinjam = 1,
  currentMonth,
  onMonthChange,
  onDayClick,
  isDayDisabled,
  modifiers,
  isComplete,
  selected,
  dayStatus,
  onCancel,
  onApply,
}) {
  const start = draft?.start;
  const end = draft?.end;

  // Teks status polite sesuai aturan Section 4
  let statusText = '';
  if (!start) {
    if (openedFrom === 'end') {
      statusText = 'Pilih tanggal mulai terlebih dahulu';
    } else {
      const earliestStr = formatTanggal(getEarliestStartDate(activeToday));
      statusText = `Pilih tanggal mulai. Paling cepat ${earliestStr}.`;
    }
  } else if (start && !end) {
    if (maxEndDate && maxEndDate !== Infinity) {
      statusText = `Mulai ${formatTanggal(start)}. Pilih tanggal kembali (paling lambat ${formatTanggal(maxEndDate)}).`;
    } else {
      statusText = `Mulai ${formatTanggal(start)}. Pilih tanggal kembali.`;
    }
  } else if (start && end) {
    const startDateObj = isoToDate(start);
    const prepDateStr = startDateObj
      ? formatTanggal(dateToISO(addDaysLocal(startDateObj, -1)))
      : '-';
    statusText = `Pinjam ${formatTanggal(start)} - ${formatTanggal(end)}. Barang disiapkan ${prepDateStr}.`;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Teks indikator kuota unit di atas kalender */}
      <div className="text-xs font-medium text-foreground px-1 text-center sm:text-left">
        Menampilkan tanggal tersedia untuk {jumlahPinjam} unit.
      </div>

      {/* Kalender React-Day-Picker */}
      <div className="flex justify-center w-full">
        <Calendar
          mode="range"
          selected={selected}
          onDayClick={onDayClick}
          disabled={isDayDisabled}
          modifiers={modifiers}
          locale={idLocale}
          weekStartsOn={1}
          dayStatus={dayStatus}
          month={currentMonth}
          onMonthChange={onMonthChange}
          className="p-1 sm:p-2 [--cell-size:2.25rem] sm:[--cell-size:2.5rem]"
        />
      </div>

      <div
        className="grid grid-cols-2 gap-2 px-1 text-[11px] text-muted-foreground"
        aria-label="Legenda kalender"
      >
        <Legend color="bg-background" label="Bisa dipilih" />
        <Legend color="bg-day-partial text-day-partial-foreground" label="Sebagian terpakai" />
        <Legend color="bg-day-booked text-day-booked-foreground" label="Dipinjam" />
        <Legend
          color="bg-day-buffer text-day-buffer-foreground"
          label="Persiapan/pengecekan peminjam lain"
        />
        <Legend color="bg-day-blocked text-day-blocked-foreground" label="Tidak bisa dipilih" />
      </div>

      {/* Ringkasan status pilihan dengan aria-live */}
      <div
        className="text-xs text-muted-foreground px-1 text-center sm:text-left min-h-[1.25rem]"
        aria-live="polite"
      >
        {statusText}
      </div>

      {/* Aksi Batal dan Terapkan */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="rounded-xl px-4 text-xs font-medium"
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={!isComplete}
          onClick={onApply}
          className="rounded-xl px-4 text-xs font-medium"
        >
          Terapkan
        </Button>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span
        className={`size-3 shrink-0 rounded-sm border border-border ${color}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export default RangeDatePickerCalendar;
