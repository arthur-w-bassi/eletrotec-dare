"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as catalogApi from "../catalog-api";
import { listCatalogItemsSchema, type CatalogItemListDTO } from "../catalog-types";

export function useCatalogItems(
  params?: Partial<z.input<typeof listCatalogItemsSchema>>,
): ReturnType<typeof useQuery<CatalogItemListDTO, Error>> {
  const normalized = listCatalogItemsSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.catalog.list(normalized),
    queryFn: () => catalogApi.getCatalogItems(params),
  });
}
