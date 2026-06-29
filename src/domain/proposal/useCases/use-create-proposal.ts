"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@/api/api-types";
import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";
import { buildProposalDetailDTO } from "../proposal-detail-mapper";
import type { CreateProposalPayload } from "../proposal-schemas";

export function useCreateProposal(
  options?: MutationOptions<
    Awaited<ReturnType<typeof proposalApi.postProposal>>,
    Error,
    CreateProposalPayload
  >,
): ReturnType<
  typeof useMutation<
    Awaited<ReturnType<typeof proposalApi.postProposal>>,
    Error,
    CreateProposalPayload
  >
> {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: proposalApi.postProposal,
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
