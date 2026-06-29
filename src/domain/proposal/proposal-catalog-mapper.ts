import type { CatalogItemDTO } from "@/domain/catalog/catalog-types";

import { mapPrismaServiceCategoryToUi } from "./proposal-category-map";
import type { ProposalService } from "./proposal-types";

export function mapCatalogItemToProposalService(item: CatalogItemDTO): ProposalService {
  return {
    id: item.id,
    title: item.name,
    description: item.description ?? "",
    image: item.imageUrl ?? "",
    category: mapPrismaServiceCategoryToUi(item.serviceCategory),
    price: Number.parseFloat(item.price),
  };
}
