import type { LibraryTab } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

interface Props {
  value: LibraryTab;
  onChange: (tab: LibraryTab) => void;
}

const TABS: { id: LibraryTab; label: string }[] = [
  { id: "services", label: "Serviços" },
  { id: "templates", label: "Pré-modelos" },
];

export function LibraryTabs({ value, onChange }: Props): React.ReactElement {
  return (
    <div className="flex gap-[0.25rem] rounded-[0.5rem] bg-zinc-100 p-[0.25rem] dark:bg-zinc-900">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-[0.375rem] px-[0.625rem] py-[0.375rem] text-[0.75rem] font-medium transition-all duration-200",
            value === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-zinc-500 hover:text-foreground dark:text-zinc-400",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
