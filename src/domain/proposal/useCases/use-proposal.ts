"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";
import { buildProposalDetailDTO } from "../proposal-detail-mapper";
import type { ProposalDetailDTO } from "../proposal-types";

export function useProposal(
  id: string,
): ReturnType<typeof useQuery<ProposalDetailDTO, Error>> {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id),
    queryFn: async () => {
      const proposal = await proposalApi.getProposalById(id);
      return buildProposalDetailDTO(proposal);
    },
    enabled: Boolean(id),
  });
}
