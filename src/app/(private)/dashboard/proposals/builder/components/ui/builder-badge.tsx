import { cn } from "@/helpers/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
  dotClassName?: string;
}

export function BuilderBadge({ children, className, dotClassName }: Props): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.375rem] rounded-full border border-zinc-200 bg-background px-[0.625rem] py-[0.25rem]",
        "text-[0.75rem] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
        className,
      )}
    >
      <span
        className={cn("size-[0.4375rem] rounded-full bg-[var(--builder-draft)]", dotClassName)}
        aria-hidden
      />
      {children}
    </span>
  );
}
