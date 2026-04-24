"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as catalogApi from "../catalog-api";
import type { UpdateCatalogItemPayload } from "../catalog-types";

export type UpdateCatalogItemVariables = { id: string; payload: UpdateCatalogItemPayload };

export function useUpdateCatalogItem(
  options?: MutationOptions<
    Awaited<ReturnType<typeof catalogApi.putCatalogItem>>,
    Error,
    UpdateCatalogItemVariables
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof catalogApi.putCatalogItem>>,
    Error,
    UpdateCatalogItemVariables
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, payload }) => catalogApi.putCatalogItem(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
