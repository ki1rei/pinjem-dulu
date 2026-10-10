const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
