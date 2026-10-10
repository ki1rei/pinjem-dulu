import Link from 'next/link';

const Home = () => {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        PinjemDulu
      </h1>
      <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
        Kelola peminjaman inventaris organisasi mahasiswa dengan lebih tertib dan transparan.
      </p>
      <div className="mt-8 flex w-full max-w-sm justify-center">
        <Link
          href="/login"
          className="rounded-xl bg-blue-600 px-8 py-3 text-center font-semibold text-white hover:bg-blue-700"
        >
          Masuk
        </Link>
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Akun dikelola oleh penanggung jawab. Tidak ada pendaftaran mandiri.
      </p>
    </section>
  );
};

export default Home;
