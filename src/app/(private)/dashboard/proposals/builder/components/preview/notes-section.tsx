"use client";

import { useProposalBuilder } from "../proposal-builder-provider";

interface Props {
  notes: string;
}

export function NotesSection({ notes }: Props): React.ReactElement {
  const { updateNotes } = useProposalBuilder();

  return (
    <section className="mb-[2rem]">
      <h3 className="mb-[0.75rem] text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
        Observações
      </h3>
      <textarea
        value={notes}
        onChange={(event) => updateNotes(event.target.value)}
        placeholder="Adicione observações adicionais..."
        rows={4}
        className="w-full resize-none rounded-[0.625rem] border border-zinc-200 bg-zinc-50/50 px-[0.875rem] py-[0.75rem] text-[0.875rem] leading-[1.5rem] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-300 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200"
      />
    </section>
  );
}
