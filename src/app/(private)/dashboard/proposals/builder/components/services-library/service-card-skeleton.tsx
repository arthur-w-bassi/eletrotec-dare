export function ServiceCardSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse overflow-hidden rounded-[0.625rem] border border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-[0.5rem] p-[0.75rem]">
        <div className="h-[0.875rem] w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-[0.625rem] w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-[0.625rem] w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="mt-[0.25rem] h-[1.125rem] w-[4rem] rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
