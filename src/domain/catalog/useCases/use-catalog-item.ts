"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as catalogApi from "../catalog-api";
import type { CatalogItemDTO } from "../catalog-types";

export function useCatalogItem(id: string): ReturnType<typeof useQuery<CatalogItemDTO, Error>> {
  return useQuery({
    queryKey: queryKeys.catalog.detail(id),
    queryFn: () => catalogApi.getCatalogItemById(id),
    enabled: Boolean(id),
  });
}
