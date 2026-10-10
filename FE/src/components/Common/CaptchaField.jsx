'use client';

import { Input } from '@/components/ui/input.jsx';

/**
 * Captcha field desain login.png:
 *   BARIS PERTAMA (flex): [ kotak captcha dengan underline teks ][ tombol refresh bulat ]
 *   BARIS KEDUA         : [ input jawaban captcha full-width                         ]
 *
 * Komponen INTERNAL, field jawaban captcha membungkus `<Input>` shadcn agar
 * fokus ring, aria-invalid, dan ukuran konsisten dengan field lain di form
 * login. Kotak captcha + tombol refresh TETAP sesuai desain asli.
 *
 * Mode non-mock nanti: buatCaptcha() panggil GET /auth/captcha dan tampilkan <img src={imageUrl} />
 * menggantikan teks captcha underline.
 *
 * @param {{
 *   captchaId: string,
 *   captchaText: string,
 *   answer: string,
 *   onAnswerChange: (v: string) => void,
 *   onRefresh: () => void,
 *   disabled?: boolean,
 *   error?: string,
 *   label?: string,
 *   placeholder?: string,
 *   refreshLabel?: string,
 *   required?: boolean,
 * }} props
 */
const CaptchaField = ({
  captchaId,
  captchaText,
  answer,
  onAnswerChange,
  onRefresh,
  disabled = false,
  error = '',
  placeholder = 'Masukkan kode captcha',
  refreshLabel = 'Refresh captcha',
  required = false,
}) => {
  const id = 'captcha-answer';
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      {/* BARIS 1: Kotak captcha + tombol refresh bulat (flex satu baris) */}
      <div className="mb-2 flex items-stretch justify-between gap-3">
        {/* Kotak captcha: rounded 2xl, border tipis, teks underline ala desain */}
        <div
          aria-label={`Captcha id ${captchaId}`}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <span
            aria-hidden="true"
            className="select-none font-mono text-lg font-semibold text-zinc-800 underline decoration-zinc-400 decoration-[2px] underline-offset-[6px] dark:text-zinc-100 dark:decoration-zinc-500"
            style={{ letterSpacing: '0.2em' }}
          >
            {captchaText || '----'}
          </span>
        </div>

        {/* Tombol refresh: BULAT dengan border, full-height */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          aria-label={refreshLabel}
          title={refreshLabel}
          className="inline-flex aspect-square h-[44px] w-[44px] flex-none items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-blue-950/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {/* BARIS 2: Input jawaban captcha full-width (pakai Input shadcn) */}
      <Input
        id={id}
        type="text"
        value={answer}
        autoComplete="off"
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        placeholder={placeholder}
        className="h-12 rounded-2xl px-4 py-3 tracking-wider"
        required={required}
      />

      {error ? (
        <p id={describedBy} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default CaptchaField;
