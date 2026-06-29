"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";

export function useDeleteProposal(
  options?: MutationOptions<Awaited<ReturnType<typeof proposalApi.deleteProposal>>, Error, string>,
): ReturnType<
  typeof useMutation<Awaited<ReturnType<typeof proposalApi.deleteProposal>>, Error, string>
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: proposalApi.deleteProposal,
    onSuccess: async (data, id, onMutateResult, context) => {
      await queryClient.removeQueries({ queryKey: queryKeys.proposals.detail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      await onUserSuccess?.(data, id, onMutateResult, context);
    },
  });
}
