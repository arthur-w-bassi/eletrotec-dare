import type { MockProposal, ProposalBlock } from "./proposal-types";
import { normalizeSectionOrder } from "./proposal-section-order";

function migrateLegacySchedule(proposal: MockProposal): ProposalBlock[] {
  const blocks = proposal.blocks ?? [];
  const legacySchedule = proposal.schedule ?? [];

  const hasScheduleBlock = blocks.some((block) => block.type === "schedule");
  if (legacySchedule.length === 0 || hasScheduleBlock) {
    return blocks;
  }

  return [
    ...blocks,
    {
      id: `schedule-block-${crypto.randomUUID()}`,
      type: "schedule" as const,
      items: legacySchedule,
    },
  ];
}

export function normalizeProposal(proposal: MockProposal): MockProposal {
  const blocks = migrateLegacySchedule(proposal);
  const normalized: MockProposal = {
    ...proposal,
    cover: {
      ...proposal.cover,
      clientAddress: proposal.cover.clientAddress ?? "",
      clientDocument: proposal.cover.clientDocument ?? "",
      clientContact: proposal.cover.clientContact ?? "",
    },
    lineItems: proposal.lineItems ?? [],
    blocks,
    schedule: [],
    notes: proposal.notes ?? "",
    introduction: proposal.introduction ?? "",
    financial: proposal.financial ?? { discountPercent: 0, taxPercent: 0 },
  };

  return {
    ...normalized,
    sectionOrder: normalizeSectionOrder(normalized),
  };
}
