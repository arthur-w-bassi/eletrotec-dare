import type { MockProposal, ProposalBlock } from "./proposal-types";

export const INTRODUCTION_SECTION_KEY = "introduction";
export const SERVICES_SECTION_KEY = "services";

export function blockSectionKey(blockId: string): string {
  return `block:${blockId}`;
}

export function buildDefaultSectionOrder(blocks: ProposalBlock[]): string[] {
  return [
    INTRODUCTION_SECTION_KEY,
    SERVICES_SECTION_KEY,
    ...blocks.map((block) => blockSectionKey(block.id)),
  ];
}

export function normalizeSectionOrder(proposal: MockProposal): string[] {
  const blocks = proposal.blocks ?? [];
  const defaultOrder = buildDefaultSectionOrder(blocks);

  if (!proposal.sectionOrder?.length) {
    return defaultOrder;
  }

  const validKeys = new Set(defaultOrder);
  const ordered = proposal.sectionOrder.filter((key) => validKeys.has(key));
  const missing = defaultOrder.filter((key) => !ordered.includes(key));

  return [...ordered, ...missing];
}

export function toSortableSectionId(sectionKey: string): string {
  if (sectionKey === INTRODUCTION_SECTION_KEY || sectionKey === SERVICES_SECTION_KEY) {
    return `section-${sectionKey}`;
  }

  if (sectionKey.startsWith("block:")) {
    return `block-${sectionKey.slice("block:".length)}`;
  }

  return sectionKey;
}

export function fromSortableSectionId(sortableId: string): string {
  if (sortableId === "section-introduction") return INTRODUCTION_SECTION_KEY;
  if (sortableId === "section-services") return SERVICES_SECTION_KEY;
  if (sortableId.startsWith("block-")) return blockSectionKey(sortableId.slice("block-".length));

  return sortableId;
}

export function isDocumentSectionSortableId(id: string): boolean {
  return (
    id === "section-introduction" ||
    id === "section-services" ||
    id.startsWith("block-")
  );
}

export function sectionKeyLabel(sectionKey: string): string {
  if (sectionKey === INTRODUCTION_SECTION_KEY) return "Introdução";
  if (sectionKey === SERVICES_SECTION_KEY) return "Serviços";
  if (sectionKey.startsWith("block:")) return "Conteúdo";

  return "Seção";
}
