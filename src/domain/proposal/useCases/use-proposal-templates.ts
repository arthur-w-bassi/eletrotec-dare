"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as proposalApi from "../proposal-api";
import type { ProposalTemplateListDTO } from "../proposal-api";
import { listProposalTemplatesSchema } from "../proposal-schemas";

export function useProposalTemplates(
  params?: Partial<z.input<typeof listProposalTemplatesSchema>>,
): ReturnType<typeof useQuery<ProposalTemplateListDTO, Error>> {
  const normalized = listProposalTemplatesSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.proposalTemplates.list(normalized),
    queryFn: () => proposalApi.getProposalTemplates(params),
  });
}
