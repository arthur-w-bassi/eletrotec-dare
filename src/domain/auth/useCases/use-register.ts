"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as authApi from "../auth-api";
import type { RegisterPayload } from "../auth-types";

export function useRegister(
  options?: MutationOptions<Awaited<ReturnType<typeof authApi.postRegister>>, Error, RegisterPayload>,
): ReturnType<typeof useMutation<Awaited<ReturnType<typeof authApi.postRegister>>, Error, RegisterPayload>> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: authApi.postRegister,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
