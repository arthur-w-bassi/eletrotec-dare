"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";
import type { UpdateOrderPayload } from "../order-types";

export type UpdateOrderVariables = { id: string; payload: UpdateOrderPayload };

export function useUpdateOrder(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.putOrder>>,
    Error,
    UpdateOrderVariables
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof orderApi.putOrder>>,
    Error,
    UpdateOrderVariables
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, payload }) => orderApi.putOrder(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
