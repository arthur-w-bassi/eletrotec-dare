"use client";

import { CoverClientPicker } from "../customer/cover-client-picker";
import { useProposalBuilder } from "../proposal-builder-provider";
import { ProposalDocument } from "./proposal-document";

export function ProposalPreviewArea(): React.ReactElement {
  const { zoom, isNewProposal } = useProposalBuilder();
  const scale = zoom / 100;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <div className="flex-1 overflow-auto px-[1.5rem] py-[1.5rem]">
        {isNewProposal ? <CoverClientPicker /> : null}
        <div
          data-proposal-preview-scale
          className="mx-auto origin-top transition-transform duration-200 ease-out"
          style={{ transform: `scale(${scale})`, width: `${100 / scale}%` }}
        >
          <ProposalDocument />
        </div>
      </div>
    </div>
  );
}
