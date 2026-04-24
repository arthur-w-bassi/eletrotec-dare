"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";
import type { AddOrderItemPayload } from "../order-types";

export type AddOrderItemVariables = { orderId: string; payload: AddOrderItemPayload };

export function useAddOrderItem(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.postOrderItem>>,
    Error,
    AddOrderItemVariables
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof orderApi.postOrderItem>>,
    Error,
    AddOrderItemVariables
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ orderId, payload }) => orderApi.postOrderItem(orderId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
