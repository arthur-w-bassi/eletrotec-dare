"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";
import type { CreateCustomerPayload } from "../customer-types";

export function useCreateCustomer(
  options?: MutationOptions<
    Awaited<ReturnType<typeof customerApi.postCustomer>>,
    Error,
    CreateCustomerPayload
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof customerApi.postCustomer>>,
    Error,
    CreateCustomerPayload
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: customerApi.postCustomer,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
