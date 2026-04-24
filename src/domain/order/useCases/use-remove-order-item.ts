"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";

export type RemoveOrderItemVariables = { orderId: string; itemId: string };

export function useRemoveOrderItem(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.deleteOrderItem>>,
    Error,
    RemoveOrderItemVariables
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof orderApi.deleteOrderItem>>,
    Error,
    RemoveOrderItemVariables
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ orderId, itemId }) => orderApi.deleteOrderItem(orderId, itemId),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
