import { calculateFinancialSummary } from "./proposal-calculations";
import type { ProposalDocument, ProposalDetailDTO, ProposalListItemDTO } from "./proposal-types";

export function buildProposalListItemFromDocument(proposal: ProposalDocument): ProposalListItemDTO {
  const { grandTotal } = calculateFinancialSummary(proposal);

  return {
    id: proposal.id ?? "",
    number: proposal.cover.number,
    title: proposal.cover.title,
    client: proposal.cover.client,
    status: proposal.status,
    serviceCount: proposal.lineItems.length,
    grandTotal,
    createdAt: proposal.createdAt ?? "",
    updatedAt: proposal.updatedAt ?? "",
  };
}

export function buildProposalDetailDTO(proposal: ProposalDocument): ProposalDetailDTO {
  return {
    listItem: buildProposalListItemFromDocument(proposal),
    proposal,
  };
}
