"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";

export function useCancelOrder(
  options?: MutationOptions<Awaited<ReturnType<typeof orderApi.deleteOrder>>, Error, string>,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof orderApi.deleteOrder>>, Error, string>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: orderApi.deleteOrder,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
