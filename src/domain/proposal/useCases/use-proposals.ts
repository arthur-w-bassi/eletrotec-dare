"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import { listProposals } from "../proposal-list-service";
import type { ProposalListResponseDTO, MockProposal, ProposalListItemDTO } from "../proposal-types";
import { listProposalsSchema } from "../proposal-schemas";
import { getProposalById, getProposalListItemById } from "../proposal-storage";

export function useProposals(
  params?: Partial<z.input<typeof listProposalsSchema>>,
): ReturnType<typeof useQuery<ProposalListResponseDTO, Error>> {
  const normalized = listProposalsSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.proposals.list(normalized),
    queryFn: () => listProposals(normalized),
  });
}

interface ProposalDetailDTO {
  listItem: ProposalListItemDTO;
  proposal: MockProposal;
}

export function useProposal(
  id: string,
): ReturnType<typeof useQuery<ProposalDetailDTO | null, Error>> {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id),
    queryFn: () => {
      const listItem = getProposalListItemById(id);
      const proposal = getProposalById(id);
      if (!listItem || !proposal) return null;
      return { listItem, proposal };
    },
  });
}
