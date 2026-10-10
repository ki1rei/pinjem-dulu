'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';

import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';

/**
 * MultiSelectFilter: filter dropdown dengan Popover + Command + Checkbox.
 * Dipakai untuk Kategori dan OKI di katalog inventaris.
 *
 * @param {{
 *   placeholder?: string,          // "Semua Kategori" bila kosong
 *   searchPlaceholder?: string,    // "Cari kategori..."
 *   selectedPlural?: string,       // "Kategori" (untuk "2 Kategori")
 *   options: Array<{ value:string, label:string }>,
 *   value: Array<string>,          // id yang sudah dipilih
 *   onChange: (next: Array<string>) => void,
 *   className?: string,
 * }} props
 */
const MultiSelectFilter = ({
  placeholder = 'Semua',
  searchPlaceholder = 'Cari...',
  selectedPlural = 'item',
  options,
  value,
  onChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const popoverRef = useRef(null);

  const current = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const setValue = (next) => onChange(Array.isArray(next) ? next : []);

  const optionsByValue = useMemo(() => {
    const map = new Map();
    for (const o of options) map.set(o.value, o);
    return map;
  }, [options]);

  const toggleValue = (val) => {
    setValue(current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
  };

  const removeOne = (e, val) => {
    e.stopPropagation();
    e.preventDefault();
    setValue(current.filter((v) => v !== val));
  };

  const triggerLabel = useMemo(() => {
    if (current.length === 0) return placeholder;
    if (current.length === 1) {
      return optionsByValue.get(current[0])?.label || placeholder;
    }
    return `${current.length} ${selectedPlural}`;
  }, [current, optionsByValue, placeholder, selectedPlural]);

  // Filter options dengan quick search (case insensitive).
  const filteredOptions = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label || '').toLowerCase().includes(q));
  }, [options, quickSearch]);

  // Tutup popover dengan tombol Esc tambahan (Popover Radix sudah menangani
  // ini, tapi kita guard agar command input tidak intercept sebelum menutup).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'group w-full justify-between rounded-xl font-normal',
            current.length > 0 && 'border-accent/50 text-zinc-900 dark:text-zinc-100',
            className
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-[min(92vw,360px)] p-0 sm:w-80"
        align="start"
        sideOffset={6}
      >
        {/* Chip pilihan di atas daftar */}
        {current.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
            {current.map((v) => {
              const opt = optionsByValue.get(v);
              if (!opt) return null;
              return (
                <Badge key={v} variant="secondary" className="gap-1 pr-1">
                  <span className="max-w-[140px] truncate">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeOne(e, v)}
                    aria-label={`Hapus pilihan ${opt.label}`}
                    className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <Command shouldFilter={false} className="h-auto max-h-[320px]">
          <div className="flex items-center border-b border-border px-3">
            <CommandInput
              placeholder={searchPlaceholder}
              value={quickSearch}
              onValueChange={setQuickSearch}
              className="h-10 border-0 shadow-none focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>Tidak ada yang cocok.</CommandEmpty>
            <CommandGroup className="p-1">
              {filteredOptions.map((opt) => {
                const checked = current.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => toggleValue(opt.value)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleValue(opt.value)}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <span className="flex-1 text-sm">{opt.label}</span>
                    {checked && <Check size={14} className="text-accent" aria-hidden="true" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectFilter;
