'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';

/**
 * Input password dengan tombol toggle tampil/sembunyikan.
 * Komponen INTERNAL (bukan primitif shadcn), tapi membungkus <Input> + <Label>
 * shadcn agar behavior fokus, aria-invalid, ring fokus konsisten dengan
 * field Email di login.
 *
 * @param {{
 *   id?: string,
 *   name?: string,
 *   label?: string,
 *   placeholder?: string,
 *   value: string,
 *   onChange: (v: string) => void,
 *   disabled?: boolean,
 *   error?: string,
 *   autoComplete?: string,
 *   required?: boolean,
 * }} props
 */
const PasswordInput = ({
  id = 'password',
  name = 'password',
  label = 'Password',
  placeholder = '••••••••',
  value,
  onChange,
  disabled = false,
  error = '',
  autoComplete = 'current-password',
  required = false,
}) => {
  const [show, setShow] = useState(false);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-300"
      >
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className="h-12 rounded-2xl px-4 py-3 pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          tabIndex={-1}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
        >
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 4.22-5.94" />
              <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19" />
              <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p id={describedBy} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default PasswordInput;
