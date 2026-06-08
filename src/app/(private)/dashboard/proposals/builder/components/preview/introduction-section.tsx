"use client";

import { useProposalBuilder } from "../proposal-builder-provider";
import { InlineEditableField } from "./inline-editable-field";

interface Props {
  introduction: string;
}

export function IntroductionSection({ introduction }: Props): React.ReactElement {
  const { updateIntroduction } = useProposalBuilder();

  return (
    <section>
      <h3 className="mb-[0.75rem] text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
        Introdução
      </h3>
      <InlineEditableField
        value={introduction}
        onChange={updateIntroduction}
        multiline
        className="text-[0.9375rem] leading-[1.625rem] text-zinc-700"
        placeholder="Escreva uma introdução..."
      />
    </section>
  );
}
