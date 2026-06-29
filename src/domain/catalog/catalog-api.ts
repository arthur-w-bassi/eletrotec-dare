import type { z } from "zod";

import { api } from "@/api/api";
import { apiPaths } from "@/api/api-paths";
import { handleApiResponse } from "@/domain/utils/api-utils";

import {
  listCatalogItemsSchema,
  type CatalogItemDTO,
  type CatalogItemListDTO,
  type CreateCatalogItemPayload,
  type UpdateCatalogItemPayload,
} from "./catalog-types";

export async function postCatalogItem(payload: CreateCatalogItemPayload): Promise<CatalogItemDTO> {
  const res = await api.post(apiPaths.catalog.create, { json: payload });
  return handleApiResponse<CatalogItemDTO>(res);
}

export async function getCatalogItems(
  params?: Partial<z.input<typeof listCatalogItemsSchema>>,
): Promise<CatalogItemListDTO> {
  const parsed = listCatalogItemsSchema.parse(params ?? {});
  const searchParams: Record<string, string> = {
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
    includeInactive: String(parsed.includeInactive),
  };
  if (parsed.search !== undefined) {
    searchParams.search = parsed.search;
  }
  if (parsed.type !== undefined) {
    searchParams.type = parsed.type;
  }
  if (parsed.serviceCategory !== undefined) {
    searchParams.serviceCategory = parsed.serviceCategory;
  }
  const res = await api.get(apiPaths.catalog.list, { searchParams });
  return handleApiResponse<CatalogItemListDTO>(res);
}

export async function getCatalogItemById(id: string): Promise<CatalogItemDTO> {
  const res = await api.get(apiPaths.catalog.details(id));
  return handleApiResponse<CatalogItemDTO>(res);
}

export async function putCatalogItem(
  id: string,
  payload: UpdateCatalogItemPayload,
): Promise<CatalogItemDTO> {
  const res = await api.put(apiPaths.catalog.update(id), { json: payload });
  return handleApiResponse<CatalogItemDTO>(res);
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const res = await api.delete(apiPaths.catalog.delete(id));
  await handleApiResponse<null>(res);
}
