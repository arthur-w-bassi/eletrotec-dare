import type { ServiceCategory } from "@/domain/proposal/proposal-types";
import { getCategoryLabel } from "@/domain/proposal/proposal-labels";
import { cn } from "@/helpers/cn";

interface Props {
  categories: ServiceCategory[];
  value: ServiceCategory | "All";
  onChange: (value: ServiceCategory | "All") => void;
}

const ALL_CATEGORIES: (ServiceCategory | "All")[] = ["All"];

export function CategoryFilter({ categories, value, onChange }: Props): React.ReactElement {
  const options = [...ALL_CATEGORIES, ...categories];

  return (
    <div className="flex flex-wrap gap-[0.375rem]">
      {options.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            "rounded-full border px-[0.625rem] py-[0.25rem] text-[0.75rem] font-medium transition-all duration-200",
            value === category
              ? "border-foreground bg-foreground text-background"
              : "border-zinc-200 bg-background text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900",
          )}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
