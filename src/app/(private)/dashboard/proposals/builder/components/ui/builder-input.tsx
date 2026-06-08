import { cn } from "@/helpers/cn";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export function BuilderInput({ className, ...props }: Props): React.ReactElement {
  return (
    <input
      className={cn(
        "w-full rounded-[0.5rem] border border-zinc-300 bg-background px-[0.75rem] py-[0.5rem]",
        "text-[0.8125rem] text-foreground placeholder:text-zinc-400",
        "transition-colors duration-200 focus:border-zinc-400 focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-500 dark:focus-visible:ring-zinc-800",
        className,
      )}
      {...props}
    />
  );
}
