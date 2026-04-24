"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as authApi from "../auth-api";

export function useLogout(
  options?: MutationOptions<void, Error, void>,
): ReturnType<typeof useMutation<void, Error, void>> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: authApi.postLogout,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
