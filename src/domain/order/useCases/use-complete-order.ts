"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";

export function useCompleteOrder(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.postOrderComplete>>,
    Error,
    string
  >,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof orderApi.postOrderComplete>>, Error, string>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: orderApi.postOrderComplete,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
