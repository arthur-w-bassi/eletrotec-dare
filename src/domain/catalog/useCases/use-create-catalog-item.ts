"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as catalogApi from "../catalog-api";
import type { CreateCatalogItemPayload } from "../catalog-types";

export function useCreateCatalogItem(
  options?: MutationOptions<
    Awaited<ReturnType<typeof catalogApi.postCatalogItem>>,
    Error,
    CreateCatalogItemPayload
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof catalogApi.postCatalogItem>>,
    Error,
    CreateCatalogItemPayload
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: catalogApi.postCatalogItem,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
