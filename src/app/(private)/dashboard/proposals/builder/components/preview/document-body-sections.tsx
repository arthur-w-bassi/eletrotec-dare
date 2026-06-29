"use client";

import { useMemo } from "react";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { ProposalDocument } from "@/domain/proposal/proposal-types";
import {
  INTRODUCTION_SECTION_KEY,
  SERVICES_SECTION_KEY,
  normalizeSectionOrder,
  toSortableSectionId,
} from "@/domain/proposal/proposal-section-order";

import { IntroductionSection } from "./introduction-section";
import { ServicesSection } from "./services-section";
import { SortableContentBlock } from "./sortable-content-block";
import { SortableSectionShell } from "./sortable-section-shell";

interface Props {
  proposal: ProposalDocument;
}

export function DocumentBodySections({ proposal }: Props): React.ReactElement {
  const sectionOrder = normalizeSectionOrder(proposal);
  const blocksById = useMemo(
    () => new Map(proposal.blocks.map((block) => [block.id, block])),
    [proposal.blocks],
  );
  const sortableIds = sectionOrder.map((key) => toSortableSectionId(key));

  return (
    <section id="proposal-content" className="mb-[2rem] scroll-mt-[8rem]">
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-[0.75rem]">
          {sectionOrder.map((sectionKey) => {
            if (sectionKey === INTRODUCTION_SECTION_KEY) {
              return (
                <SortableSectionShell
                  key={sectionKey}
                  sortableId={toSortableSectionId(sectionKey)}
                  sectionKey={sectionKey}
                  sectionLabel="Introdução"
                >
                  <IntroductionSection introduction={proposal.introduction} />
                </SortableSectionShell>
              );
            }

            if (sectionKey === SERVICES_SECTION_KEY) {
              return (
                <SortableSectionShell
                  key={sectionKey}
                  sortableId={toSortableSectionId(sectionKey)}
                  sectionKey={sectionKey}
                  sectionLabel="Serviços"
                >
                  <ServicesSection lineItems={proposal.lineItems} />
                </SortableSectionShell>
              );
            }

            if (sectionKey.startsWith("block:")) {
              const blockId = sectionKey.slice("block:".length);
              const block = blocksById.get(blockId);
              if (!block) return null;

              return <SortableContentBlock key={sectionKey} block={block} />;
            }

            return null;
          })}
        </div>
      </SortableContext>
    </section>
  );
}
