"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as authApi from "../auth-api";
import type { LoginPayload } from "../auth-types";

export function useLogin(
  options?: MutationOptions<Awaited<ReturnType<typeof authApi.postLogin>>, Error, LoginPayload>,
): ReturnType<typeof useMutation<Awaited<ReturnType<typeof authApi.postLogin>>, Error, LoginPayload>> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: authApi.postLogin,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
