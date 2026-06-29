"use client";

import { useMemo } from "react";

import type { z } from "zod";

import { listCatalogItemsSchema } from "@/domain/catalog/catalog-types";
import { useCatalogItems } from "@/domain/catalog/useCases/use-catalog-items";

import { mapUiServiceCategoryToPrisma } from "../proposal-category-map";
import { mapCatalogItemToProposalService } from "../proposal-catalog-mapper";
import type { ServiceCategory } from "../proposal-types";

const PROPOSAL_SERVICES_PAGE_SIZE = 100;

export interface UseProposalServicesParams {
  search?: string;
  category?: ServiceCategory | "All";
  page?: number;
  pageSize?: number;
}

function buildCatalogParams(
  params: UseProposalServicesParams,
): Partial<z.input<typeof listCatalogItemsSchema>> {
  const catalogParams: Partial<z.input<typeof listCatalogItemsSchema>> = {
    type: "SERVICE",
    includeInactive: false,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? PROPOSAL_SERVICES_PAGE_SIZE,
  };

  if (params.search !== undefined && params.search.trim() !== "") {
    catalogParams.search = params.search.trim();
  }

  if (params.category !== undefined && params.category !== "All") {
    catalogParams.serviceCategory = mapUiServiceCategoryToPrisma(params.category);
  }

  return catalogParams;
}

export function useProposalServices(params: UseProposalServicesParams = {}) {
  const catalogParams = buildCatalogParams(params);
  const query = useCatalogItems(catalogParams);

  const services = useMemo(
    () => query.data?.items.map(mapCatalogItemToProposalService) ?? [],
    [query.data?.items],
  );

  return {
    ...query,
    services,
  };
}
