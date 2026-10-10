'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTanggal } from '@/lib/format.js';

/**
 * Komponen tombol trigger tanggal untuk RangeDatePicker.
 *
 * @param {object} props
 * @param {React.Ref<HTMLButtonElement>} [props.buttonRef]
 * @param {string} props.label
 * @param {string|null} [props.value]
 * @param {string} [props.placeholder='Pilih Tanggal']
 * @param {boolean} [props.disabled=false]
 * @param {string|boolean} [props.error=false]
 * @param {boolean} props.isOpen
 * @param {string} props.calendarId
 * @param {() => void} props.onClick
 */
export const RangeDatePickerTrigger = React.forwardRef(function RangeDatePickerTrigger(
  {
    buttonRef,
    label,
    value,
    placeholder = 'Pilih Tanggal',
    disabled = false,
    error = false,
    isOpen,
    calendarId,
    onClick,
    className,
    ...props
  },
  ref
) {
  return (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-controls={calendarId}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-label={`${label}, nilai: ${value ? formatTanggal(value) : 'belum dipilih'}`}
        onClick={onClick}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-background px-3.5 py-2.5 text-sm transition-colors text-left outline-none',
          'hover:border-zinc-400 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
          error ? 'border-destructive text-destructive' : 'border-input',
          disabled && 'opacity-50 cursor-not-allowed bg-muted pointer-events-none',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="truncate">{value ? formatTanggal(value) : placeholder}</span>
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  );
});

export default RangeDatePickerTrigger;
