import type { ListProposalsParams } from "./proposal-schemas";
import { listProposalsSchema } from "./proposal-schemas";
import { getAllProposalListItems } from "./proposal-storage";
import type { ProposalListResponseDTO } from "./proposal-types";

export function listProposals(params?: Partial<ListProposalsParams>): ProposalListResponseDTO {
  const normalized = listProposalsSchema.parse(params ?? {});
  let items = getAllProposalListItems();

  if (normalized.status) {
    items = items.filter((item) => item.status === normalized.status);
  }

  if (normalized.search) {
    const query = normalized.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.number.toLowerCase().includes(query) ||
        item.client.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query),
    );
  }

  const total = items.length;
  const start = (normalized.page - 1) * normalized.pageSize;
  const paginated = items.slice(start, start + normalized.pageSize);

  return {
    items: paginated,
    total,
    page: normalized.page,
    pageSize: normalized.pageSize,
  };
}
