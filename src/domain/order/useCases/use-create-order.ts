"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";
import type { CreateOrderPayload } from "../order-types";

export function useCreateOrder(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.postOrder>>,
    Error,
    CreateOrderPayload
  >,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof orderApi.postOrder>>, Error, CreateOrderPayload>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: orderApi.postOrder,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
