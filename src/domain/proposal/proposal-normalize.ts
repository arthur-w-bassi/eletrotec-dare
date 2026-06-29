import type { MockProposal, ProposalBlock, ProposalLineItem } from "./proposal-types";
import { MAX_SERVICE_IMAGES } from "./proposal-types";
import { normalizeSectionOrder } from "./proposal-section-order";

type LegacyProposalLineItem = ProposalLineItem & { image?: string };

function normalizeLineItem(item: LegacyProposalLineItem): ProposalLineItem {
  const images =
    item.images?.length && item.images.length > 0
      ? item.images.slice(0, MAX_SERVICE_IMAGES)
      : item.image
        ? [item.image]
        : [];

  return {
    id: item.id,
    serviceId: item.serviceId,
    title: item.title,
    description: item.description,
    images,
    qty: item.qty,
    unitPrice: item.unitPrice,
  };
}

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
    lineItems: (proposal.lineItems ?? []).map((item) =>
      normalizeLineItem(item as LegacyProposalLineItem),
    ),
    blocks,
    schedule: [],
    notes: proposal.notes ?? "",
    introduction: proposal.introduction ?? "",
    financial: proposal.financial ?? { discountPercent: 0, taxPercent: 0 },
    internalCosts: proposal.internalCosts ?? [],
  };

  return {
    ...normalized,
    sectionOrder: normalizeSectionOrder(normalized),
  };
}
