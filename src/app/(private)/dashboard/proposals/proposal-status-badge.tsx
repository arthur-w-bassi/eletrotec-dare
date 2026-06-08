"use client";

import type { ProposalStatusValue } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

const LABELS: Record<ProposalStatusValue, string> = {
  draft: "Rascunho",
  completed: "Concluído",
};

const STYLES: Record<ProposalStatusValue, string> = {
  draft: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
};

export function ProposalStatusBadge({
  status,
}: {
  status: ProposalStatusValue;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-[0.5rem] py-[0.125rem] text-[0.75rem] font-medium",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
