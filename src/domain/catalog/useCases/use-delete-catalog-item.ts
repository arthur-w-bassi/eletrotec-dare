"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as catalogApi from "../catalog-api";

export function useDeleteCatalogItem(
  options?: MutationOptions<Awaited<ReturnType<typeof catalogApi.deleteCatalogItem>>, Error, string>,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof catalogApi.deleteCatalogItem>>, Error, string>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: catalogApi.deleteCatalogItem,
    onSuccess: async (data, id, onMutateResult, context) => {
      await queryClient.removeQueries({ queryKey: queryKeys.catalog.detail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });
      await onUserSuccess?.(data, id, onMutateResult, context);
    },
  });
}
