"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";
import { buildProposalDetailDTO } from "../proposal-detail-mapper";

export function useCompleteProposal(
  options?: MutationOptions<
    Awaited<ReturnType<typeof proposalApi.postProposalComplete>>,
    Error,
    string
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof proposalApi.postProposalComplete>>,
    Error,
    string
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: proposalApi.postProposalComplete,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      if (data.id) {
        queryClient.setQueryData(
          queryKeys.proposals.detail(data.id),
          buildProposalDetailDTO(data),
        );
      }
      await onUserSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
