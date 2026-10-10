'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.js';
import { ROLES, STATUS_AKUN } from '@/lib/constants.js';
import { createCaptcha } from '@/lib/api/auth.js';
import { mockUsers } from '@/data/mock/users.js';
import PasswordInput from '@/components/Common/PasswordInput.jsx';
import CaptchaField from '@/components/Common/CaptchaField.jsx';
import Loader from '@/components/Common/Loader.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles } from 'lucide-react';

/**
 * @param {object} r
 */
function quickUser(r) {
  return {
    id: r.id,
    nama: r.nama,
    nim: r.nim,
    email: r.email,
    organisasi:
      typeof r.organisasi === 'object' && r.organisasi
        ? r.organisasi.nama
        : String(r.organisasi ?? ''),
    role: r.role,
    status_akun: r.status_akun,
  };
}

const roleLabel = Object.freeze({
  [ROLES.PEMINJAM]: 'Mahasiswa',
  [ROLES.PENANGGUNG_JAWAB]: 'Penanggung Jawab Inventaris',
});

const LoginView = () => {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [errors, setErrors] = useState(
    /** @type {{email?:string,password?:string,captchaAnswer?:string}} */ ({})
  );
  const [errorGlobal, setErrorGlobal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  const quickUsers = useMemo(() => {
    return mockUsers.map(quickUser);
  }, []);

  function regenerateCaptcha() {
    const c = createCaptcha();
    setCaptchaId(c.captchaId);
    setCaptchaText(c.answer);
    setCaptchaAnswer('');
  }

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      const target = user.role === ROLES.PENANGGUNG_JAWAB ? '/pj/dashboard' : '/peminjam/dashboard';
      router.replace(target);
    }
  }, [isLoading, user, router]);

  function clearAllErrors() {
    setErrors({});
    setErrorGlobal('');
  }

  /**
   * @param {object} rawUser
   * @param {'quick'|'submit'} [mode]
   */
  async function doLogin(rawUser, mode = 'submit') {
    if (submitting) return;
    clearAllErrors();
    setSubmitting(true);
    try {
      await login({
        email: rawUser.email,
        password: rawUser.password || '',
        captchaId: mode === 'quick' ? 'MOCK-QUICKLOGIN' : captchaId,
        captchaAnswer: mode === 'quick' ? '' : captchaAnswer.trim(),
      });
      const target =
        rawUser.role === ROLES.PENANGGUNG_JAWAB ? '/pj/dashboard' : '/peminjam/dashboard';
      router.replace(target);
    } catch (err) {
      const fieldErrors = {};
      if (err && err.errors && typeof err.errors === 'object') {
        if (err.errors.captchaAnswer) fieldErrors.captchaAnswer = err.errors.captchaAnswer;
        if (err.errors.email) fieldErrors.email = err.errors.email;
        if (err.errors.password) fieldErrors.password = err.errors.password;
      }
      const statusCode = err && typeof err.statusCode === 'number' ? err.statusCode : 0;
      const message = (err && err.message) || 'Gagal masuk. Silakan coba lagi.';
      if (statusCode === 401) {
        fieldErrors.email = message;
      } else if (statusCode === 403) {
        setErrorGlobal(message);
      } else if (!Object.keys(fieldErrors).length) {
        setErrorGlobal(message);
      }
      setErrors(fieldErrors);
      regenerateCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    const emailTrim = email.trim();

    if (!emailTrim) {
      nextErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      nextErrors.email = 'Format email tidak valid.';
    }
    if (!password || password.length < 6) {
      nextErrors.password = 'Kata sandi minimal 6 karakter.';
    }
    if (!captchaAnswer.trim()) {
      nextErrors.captchaAnswer = 'Jawaban captcha wajib diisi.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    doLogin({
      email: emailTrim,
      password,
    });
  }

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Loader size={48} />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex min-h-screen w-full">
        {/* Panel kiri: BIRU TUA POLOS (tanpa logo, tanpa teks, tanpa gradien). Hidden < md */}
        <aside
          aria-hidden="true"
          className="hidden w-1/2 shrink-0 md:flex md:items-stretch lg:w-[48%]"
        >
          <div className="flex h-full w-full flex-col bg-primary" />
        </aside>

        {/* Panel kanan: form + logo + copyright footer. Full-width di mobile */}
        <section className="flex min-h-screen w-full flex-1 flex-col items-center justify-start px-5 py-10 sm:px-8 md:w-1/2 md:px-12 md:py-14 lg:w-[52%] lg:px-20 lg:py-20 xl:px-28">
          <div className="flex w-full max-w-xl flex-1 flex-col">
            {/* Logo + brand, small di mobile top center-md+, inline di desktop top-left */}
            <Link
              href="/"
              aria-label="PinjemDulu beranda"
              className="mb-10 inline-flex items-center gap-3 self-start"
            >
              {/* <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="22"
                  height="22"
                >
                  <path d="M12 2l2.39 4.84L20 8l-4 3.9.95 5.5L12 14.77 7.05 17.4 8 11.9 4 8l5.61-1.16z" />
                </svg>
              </span> */}
              <span className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-brand-solid text-white shadow-sm sm:h-[44px] sm:w-[44px]">
                <Sparkles size={24} strokeWidth={2.2} />
              </span>
              <span className="flex items-baseline text-2xl font-extrabold tracking-tight">
                <span className="text-zinc-900 dark:text-zinc-100">Pinjem</span>
                <span className="text-primary dark:text-blue-400">Dulu</span>
              </span>
            </Link>

            {/* Header sapaan + judul + deskripsi */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Selamat Datang Kembali!
              </p>
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[32px]">
                Siap mengelola atau meminjam?
              </h1>
              <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Masuk untuk mengakses layanan inventaris dan peminjaman OKI
              </p>
            </div>

            {errorGlobal ? (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              >
                {errorGlobal}
              </div>
            ) : null}

            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="mb-2 block text-zinc-600 dark:text-zinc-300">
                  Email
                  <span className="ml-0.5 text-rose-500">*</span>
                </Label>
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((s) => ({ ...s, email: undefined }));
                    }}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    placeholder="contoh@mail.uma.ac.id"
                    className="h-12 rounded-2xl px-4 py-3"
                  />
                  {errors.email ? (
                    <p id="email-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Password */}
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((s) => ({ ...s, password: undefined }));
                }}
                disabled={submitting}
                error={errors.password}
                required
                placeholder="••••••••"
              />

              {/* Captcha: kotak + refresh (sebaris) di atas, input jawaban di bawah */}
              <CaptchaField
                captchaId={captchaId}
                captchaText={captchaText}
                answer={captchaAnswer}
                onAnswerChange={(v) => {
                  setCaptchaAnswer(v);
                  if (errors.captchaAnswer) setErrors((s) => ({ ...s, captchaAnswer: undefined }));
                }}
                onRefresh={() => {
                  clearAllErrors();
                  regenerateCaptcha();
                }}
                disabled={submitting}
                error={errors.captchaAnswer}
                placeholder="Masukkan kode captcha"
                refreshLabel="Dapatkan captcha baru"
              />

              {/* Tombol Masuk: full-width, warna navy SAMA dengan panel kiri */}
              <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-2xl">
                {submitting ? (
                  <>
                    <Loader size={18} color="var(--primary-foreground)" inline />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </Button>
            </form>

            {/* Panel Masuk cepat (khusus NEXT_PUBLIC_USE_MOCK=true) */}
            {useMock ? (
              <div className="mt-10 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-blue-400">
                      Mode Mock Aktif
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Cepat pilih akun di bawah — tanpa captcha.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Mock
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {quickUsers.map((u) => {
                    const isNonaktif = u.status_akun !== STATUS_AKUN.AKTIF;
                    return (
                      <Button
                        key={u.id}
                        type="button"
                        variant="outline"
                        disabled={submitting}
                        onClick={() =>
                          doLogin(
                            {
                              email: u.email,
                              password: '',
                              role: u.role,
                            },
                            'quick'
                          )
                        }
                        className="group h-auto w-full justify-start gap-3 rounded-2xl border-border bg-card p-3 text-left font-normal normal-case shadow-none hover:border-primary/40 hover:bg-blue-50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500/50 dark:hover:bg-blue-950/20 dark:hover:text-zinc-100"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {u.nama}
                            </p>
                            {isNonaktif ? (
                              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                Nonaktif
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {u.email} · NIM {u.nim}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="inline-flex items-center rounded-md bg-zinc-200/70 px-1.5 py-0.5 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                              {roleLabel[u.role] || u.role}
                            </span>
                            <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">·</span>
                            <span className="text-zinc-500 dark:text-zinc-400">{u.organisasi}</span>
                          </p>
                        </div>
                        <span className="mt-1 shrink-0 text-zinc-400 transition group-hover:text-primary dark:text-zinc-500 dark:group-hover:text-blue-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="16"
                            height="16"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Footer minimal: hanya hak cipta, tanpa "OKI FT" dll */}
            <footer className="mt-14 pb-4 pt-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:mt-auto">
              © {new Date().getFullYear()} PinjemDulu – All Rights Reserved.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginView;
