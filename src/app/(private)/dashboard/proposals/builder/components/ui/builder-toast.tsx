"use client";

import { useProposalBuilder } from "../proposal-builder-provider";

export function BuilderToast(): React.ReactElement | null {
  const { toast, dismissToast } = useProposalBuilder();

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-[1.5rem] left-1/2 z-50 -translate-x-1/2">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-[0.75rem] rounded-full border border-zinc-200 bg-foreground px-[1.25rem] py-[0.625rem] text-[0.8125rem] font-medium text-background shadow-lg"
      >
        {toast.message}
        <button
          type="button"
          onClick={dismissToast}
          className="text-background/70 hover:text-background"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
