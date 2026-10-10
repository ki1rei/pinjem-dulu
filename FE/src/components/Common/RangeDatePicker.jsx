'use client';

import * as React from 'react';

import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { dateToISO, isoToDate } from '@/lib/format.js';
import { getDayStatus, getMaxEndDate } from '@/lib/date-rules.js';
import {
  createRangeSelectionContext,
  getPhase,
  reduceRangeSelection,
} from '@/lib/range-selection.js';
import { RangeDatePickerTrigger } from './RangeDatePickerTrigger.jsx';
import { RangeDatePickerCalendar } from './RangeDatePickerCalendar.jsx';

/**
 * Reducer pemilihan tanggal kalender (draft lokal).
 * Tidak memanggil callback induk selama pengguna berinteraksi.
 */
function draftReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        start: action.payload?.startDate || null,
        end: action.payload?.endDate || null,
      };
    case 'CLICK_DAY': {
      const { clickedISO, ctx } = action.payload;
      const res = reduceRangeSelection(state, clickedISO, ctx);
      return res.accepted ? res.state : state;
    }
    case 'RESET':
      return { start: null, end: null };
    default:
      return state;
  }
}

/**
 * Komponen pemilih rentang tanggal (RangeDatePicker) untuk pengajuan peminjaman.
 *
 * Menampilkan dua field tampilan ("Tanggal Peminjaman" dan "Tanggal Pengembalian")
 * yang membuka satu Popover berisi kalender rentang kendali penuh (bukan mode bawaan range).
 *
 * @param {object} props
 * @param {{ startDate: string|null, endDate: string|null }|null} [props.value]
 * @param {(val: { startDate: string|null, endDate: string|null }|null) => void} props.onChange
 * @param {Array<object>} [props.bookings=[]] Daftar booking aktif dari getPeminjamanAktif
 * @param {number} [props.totalBarang=1] Total unit barang
 * @param {number} [props.jumlahPinjam=1] Jumlah unit yang ingin dipinjam
 * @param {string} [props.today] Tanggal acuan "hari ini" (ISO YYYY-MM-DD), default hari ini lokal
 * @param {boolean} [props.disabled=false] Status nonaktif
 * @param {string|boolean} [props.error] Pesan error atau boolean untuk aria-invalid
 * @param {string} [props.labelStart='Tanggal Peminjaman']
 * @param {string} [props.labelEnd='Tanggal Pengembalian']
 * @param {string} [props.placeholder='Pilih Tanggal']
 * @param {string} [props.className]
 */
export default function RangeDatePicker({
  value = { startDate: null, endDate: null },
  onChange,
  bookings = [],
  totalBarang = 1,
  jumlahPinjam = 1,
  today,
  disabled = false,
  error = false,
  labelStart = 'Tanggal Peminjaman',
  labelEnd = 'Tanggal Pengembalian',
  placeholder = 'Pilih Tanggal',
  className,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [openedFrom, setOpenedFrom] = React.useState(null);

  // Draft lokal dikelola dengan useReducer dan diinisialisasi hanya saat popover dibuka
  const [draft, dispatchDraft] = React.useReducer(draftReducer, {
    start: value?.startDate || null,
    end: value?.endDate || null,
  });

  const activeToday = today || dateToISO(new Date());

  // Bulan yang sedang ditampilkan di kalender
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return isoToDate(value?.startDate) || isoToDate(activeToday) || new Date();
  });

  // Referensi trigger tombol terakhir yang diklik untuk pemulihan fokus
  const lastTriggerRef = React.useRef(null);
  const startButtonRef = React.useRef(null);
  const endButtonRef = React.useRef(null);

  const handleOpen = (triggerType) => {
    if (disabled) return;
    lastTriggerRef.current =
      triggerType === 'start' ? startButtonRef.current : endButtonRef.current;
    setOpenedFrom(triggerType);

    // Inisialisasi draft langsung dari value props saat popover dibuka
    dispatchDraft({
      type: 'INIT',
      payload: value,
    });

    const initialDate = isoToDate(value?.startDate) || isoToDate(activeToday) || new Date();
    setCurrentMonth(initialDate);
    setIsOpen(true);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleApply = () => {
    if (draft.start && draft.end) {
      onChange?.({ startDate: draft.start, endDate: draft.end });
      setIsOpen(false);
    }
  };

  const phase = getPhase(draft);

  // Batas maxEndDate dihitung sekali jika sedang dalam fase memilih tanggal kembali
  const maxEndDate = React.useMemo(() => {
    if (phase === 'end' && draft.start) {
      return getMaxEndDate(draft.start, bookings, {
        totalBarang,
        jumlah: jumlahPinjam,
        today: activeToday,
      });
    }
    return null;
  }, [phase, draft.start, bookings, totalBarang, jumlahPinjam, activeToday]);

  const selectionContext = React.useMemo(() => {
    return createRangeSelectionContext({
      bookings,
      totalBarang,
      jumlahPinjam,
      today: activeToday,
      maxEndDate,
    });
  }, [bookings, totalBarang, jumlahPinjam, activeToday, maxEndDate]);

  // Status tanggal dihitung sekali per render untuk seluruh sel bulan yang tampil
  const statusMap = React.useMemo(() => {
    const map = new Map();
    const ctx = {
      ...selectionContext,
      phase,
      start: draft.start,
      maxEndDate,
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Ambil rentang hari aktif kalender termasuk outside days
    const startDate = new Date(year, month, 1 - 7);
    const endDate = new Date(year, month + 1, 7);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const iso = dateToISO(d);
      if (iso) {
        map.set(iso, getDayStatus(iso, ctx));
      }
    }
    return map;
  }, [selectionContext, phase, draft.start, maxEndDate, currentMonth]);

  const getCachedDayStatus = React.useCallback(
    (date) => {
      const iso = typeof date === 'string' ? date : dateToISO(date);
      if (!iso) return { status: 'out_of_range', reason: 'Tanggal tidak valid', sisa: 0 };
      const cached = statusMap.get(iso);
      if (cached) return cached;
      return getDayStatus(iso, {
        ...selectionContext,
        phase,
        start: draft.start,
        maxEndDate,
      });
    },
    [statusMap, selectionContext, phase, draft.start, maxEndDate]
  );

  const handleDayClick = (day) => {
    const dayISO = dateToISO(day);
    if (!dayISO) return;
    dispatchDraft({
      type: 'CLICK_DAY',
      payload: { clickedISO: dayISO, ctx: selectionContext },
    });
  };

  const isDayDisabled = React.useCallback(
    (day) => {
      return Boolean(getCachedDayStatus(day).disabled);
    },
    [getCachedDayStatus]
  );

  const modifiers = React.useMemo(
    () => ({
      full: (date) => getCachedDayStatus(date).status === 'full',
      partial: (date) => getCachedDayStatus(date).status === 'partial',
      buffer_prep: (date) => getCachedDayStatus(date).status === 'buffer_prep',
      buffer_check: (date) => getCachedDayStatus(date).status === 'buffer_check',
      past: (date) => getCachedDayStatus(date).status === 'past',
      out_of_range: (date) => getCachedDayStatus(date).status === 'out_of_range',
      range_start: (date) => {
        const s = dateToISO(date);
        return s !== null && s === draft.start;
      },
      range_end: (date) => {
        const s = dateToISO(date);
        return s !== null && s === draft.end;
      },
      range_middle: (date) => {
        if (!draft.start || !draft.end || draft.start >= draft.end) return false;
        const s = dateToISO(date);
        return s !== null && s > draft.start && s < draft.end;
      },
    }),
    [getCachedDayStatus, draft.start, draft.end]
  );

  const calendarId = React.useId();
  const isComplete = Boolean(draft.start && draft.end);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4', className)}>
        {openedFrom !== 'end' ? (
          <PopoverAnchor asChild>
            <RangeDatePickerTrigger
              buttonRef={startButtonRef}
              label={labelStart}
              value={value?.startDate}
              placeholder={placeholder}
              disabled={disabled}
              error={error}
              isOpen={isOpen && openedFrom !== 'end'}
              calendarId={calendarId}
              onClick={() => handleOpen('start')}
            />
          </PopoverAnchor>
        ) : (
          <RangeDatePickerTrigger
            buttonRef={startButtonRef}
            label={labelStart}
            value={value?.startDate}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            isOpen={false}
            calendarId={calendarId}
            onClick={() => handleOpen('start')}
          />
        )}

        {openedFrom === 'end' ? (
          <PopoverAnchor asChild>
            <RangeDatePickerTrigger
              buttonRef={endButtonRef}
              label={labelEnd}
              value={value?.endDate}
              placeholder={placeholder}
              disabled={disabled}
              error={error}
              isOpen={isOpen && openedFrom === 'end'}
              calendarId={calendarId}
              onClick={() => handleOpen('end')}
            />
          </PopoverAnchor>
        ) : (
          <RangeDatePickerTrigger
            buttonRef={endButtonRef}
            label={labelEnd}
            value={value?.endDate}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            isOpen={false}
            calendarId={calendarId}
            onClick={() => handleOpen('end')}
          />
        )}
      </div>

      <PopoverContent
        id={calendarId}
        align="start"
        sideOffset={8}
        collisionPadding={16}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastTriggerRef.current?.focus();
        }}
        className="w-auto max-w-[calc(100vw-2rem)] p-3 sm:p-4 rounded-2xl shadow-xl border border-border bg-card text-card-foreground outline-none overflow-hidden"
      >
        <RangeDatePickerCalendar
          draft={draft}
          phase={phase}
          openedFrom={openedFrom}
          maxEndDate={maxEndDate}
          activeToday={activeToday}
          jumlahPinjam={Number(jumlahPinjam) || 1}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDayClick={handleDayClick}
          isDayDisabled={isDayDisabled}
          modifiers={modifiers}
          isComplete={isComplete}
          selected={{
            from: isoToDate(draft.start),
            to: isoToDate(draft.end),
          }}
          dayStatus={getCachedDayStatus}
          onCancel={handleCancel}
          onApply={handleApply}
        />
      </PopoverContent>
    </Popover>
  );
}
