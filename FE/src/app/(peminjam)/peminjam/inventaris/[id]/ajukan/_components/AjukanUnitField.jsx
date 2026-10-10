'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

/**
 * Field input Jumlah Unit dengan kontrol stepper naik/turun.
 */
const AjukanUnitField = React.forwardRef(function AjukanUnitField(
  {
    value,
    onChange,
    totalBarang = 1,
    availableUnits = null,
    hasDateRange = false,
    error,
    disabled = false,
    className,
  },
  ref
) {
  const currentVal = Number(value) || 1;
  const effectiveMax = hasDateRange && availableUnits !== null ? availableUnits : totalBarang;

  const handleIncrement = () => {
    if (disabled || currentVal >= effectiveMax) return;
    onChange(currentVal + 1);
  };

  const handleDecrement = () => {
    if (disabled || currentVal <= 1) return;
    onChange(currentVal - 1);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const helpText = hasDateRange
    ? `Tersedia ${effectiveMax} unit pada tanggal ini.`
    : `Maks. ${totalBarang} unit. Ketersediaan menyesuaikan tanggal yang dipilih.`;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="field-jumlah-unit" className="text-sm font-medium text-foreground">
        Jumlah Unit
      </Label>

      <div className="relative flex items-center">
        <Input
          ref={ref}
          id="field-jumlah-unit"
          type="number"
          min={1}
          max={effectiveMax}
          step={1}
          disabled={disabled}
          value={value}
          onChange={handleInputChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'field-jumlah-unit-error' : 'field-jumlah-unit-help'}
          className={cn(
            'h-11 pr-12 font-medium',
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />

        {/* Stepper buttons */}
        <div className="absolute right-1.5 flex flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            disabled={disabled || currentVal >= effectiveMax}
            onClick={handleIncrement}
            aria-label="Tambah satu unit"
            className="h-4 w-7 rounded p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            disabled={disabled || currentVal <= 1}
            onClick={handleDecrement}
            aria-label="Kurangi satu unit"
            className="h-4 w-7 rounded p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        {error ? (
          <p id="field-jumlah-unit-error" className="text-destructive font-medium">
            {error}
          </p>
        ) : (
          <p id="field-jumlah-unit-help" className="text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
});

export default AjukanUnitField;
