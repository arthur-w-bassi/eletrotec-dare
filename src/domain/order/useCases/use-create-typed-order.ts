"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import type { CreateTypedOrderPayload } from "../order-api";
import * as orderApi from "../order-api";

export function useCreateTypedOrder(
  options?: MutationOptions<
    Awaited<ReturnType<typeof orderApi.postTypedOrder>>,
    Error,
    CreateTypedOrderPayload
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof orderApi.postTypedOrder>>,
    Error,
    CreateTypedOrderPayload
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: orderApi.postTypedOrder,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
