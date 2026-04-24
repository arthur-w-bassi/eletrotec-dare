"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";
import type { UpdateCustomerPayload } from "../customer-types";

export type UpdateCustomerVariables = { id: string; payload: UpdateCustomerPayload };

export function useUpdateCustomer(
  options?: MutationOptions<
    Awaited<ReturnType<typeof customerApi.putCustomer>>,
    Error,
    UpdateCustomerVariables
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof customerApi.putCustomer>>,
    Error,
    UpdateCustomerVariables
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, payload }) => customerApi.putCustomer(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
