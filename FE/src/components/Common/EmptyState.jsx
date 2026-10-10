const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
};

export default EmptyState;
