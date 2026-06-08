import { ChevronDown } from "lucide-react";

import { cn } from "@/helpers/cn";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function BuilderSelect({ className, children, ...props }: Props): React.ReactElement {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-[0.5rem] border border-zinc-300 bg-background px-[0.75rem] py-[0.5rem] pr-[2rem]",
          "text-[0.8125rem] text-foreground transition-colors duration-200",
          "focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-500 dark:focus-visible:ring-zinc-800",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-[0.625rem] top-1/2 size-[0.875rem] -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </div>
  );
}
