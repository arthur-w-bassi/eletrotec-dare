"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";

export function useDeleteCustomer(
  options?: MutationOptions<Awaited<ReturnType<typeof customerApi.deleteCustomer>>, Error, string>,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof customerApi.deleteCustomer>>, Error, string>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: customerApi.deleteCustomer,
    onSuccess: async (data, id, onMutateResult, context) => {
      await queryClient.removeQueries({ queryKey: queryKeys.customers.detail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      await onUserSuccess?.(data, id, onMutateResult, context);
    },
  });
}
