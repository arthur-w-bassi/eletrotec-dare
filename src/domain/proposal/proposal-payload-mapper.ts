import { normalizeProposal } from "./proposal-normalize";
import type { CreateProposalPayload } from "./proposal-schemas";
import type { ProposalDocument } from "./proposal-types";

export function mapProposalToPayload(proposal: ProposalDocument): CreateProposalPayload {
  const document = normalizeProposal(proposal);

  return {
    cover: {
      title: document.cover.title,
      client: document.cover.client,
      clientAddress: document.cover.clientAddress ?? "",
      clientDocument: document.cover.clientDocument ?? "",
      clientContact: document.cover.clientContact ?? "",
      customerId: document.cover.customerId ?? null,
    },
    introduction: document.introduction,
    notes: document.notes,
    signature: document.signature,
    financial: document.financial,
    lineItems: document.lineItems.map((item) => ({
      id: item.id,
      serviceId: item.serviceId || undefined,
      title: item.title,
      description: item.description,
      images: item.images,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
    internalCosts: document.internalCosts ?? [],
    blocks: document.blocks ?? [],
    sectionOrder: document.sectionOrder,
  };
}
