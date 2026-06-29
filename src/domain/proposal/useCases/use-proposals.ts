"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";
import { listProposalsSchema } from "../proposal-schemas";
import type { ProposalListResponseDTO } from "../proposal-types";

export function useProposals(
  params?: Partial<z.input<typeof listProposalsSchema>>,
): ReturnType<typeof useQuery<ProposalListResponseDTO, Error>> {
  const normalized = listProposalsSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.proposals.list(normalized),
    queryFn: () => proposalApi.getProposals(params),
  });
}
