import { cn } from "@/helpers/cn";

type BuilderButtonVariant = "primary" | "secondary" | "ghost" | "outline";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BuilderButtonVariant;
}

const variantClasses: Record<BuilderButtonVariant, string> = {
  primary:
    "rounded-full bg-foreground px-[1rem] py-[0.4375rem] text-[0.8125rem] font-medium text-background hover:opacity-90",
  secondary:
    "rounded-full border border-zinc-300 bg-background px-[1rem] py-[0.4375rem] text-[0.8125rem] font-medium text-foreground hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900",
  outline:
    "rounded-full border border-zinc-300 bg-transparent px-[1rem] py-[0.4375rem] text-[0.8125rem] font-medium text-foreground hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900",
  ghost:
    "rounded-[0.375rem] px-[0.625rem] py-[0.375rem] text-[0.8125rem] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800",
};

export function BuilderButton({
  variant = "secondary",
  className,
  type = "button",
  onPointerDown,
  ...props
}: Props): React.ReactElement {
  return (
    <button
      type={type}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-[0.375rem] transition-all duration-200 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
