import type { z } from "zod";

import { api } from "@/api/api";
import { apiPaths } from "@/api/api-paths";
import { handleApiResponse } from "@/domain/utils/api-utils";

import {
  listProposalTemplatesSchema,
  listProposalsSchema,
  type CreateProposalPayload,
  type UpdateProposalPayload,
} from "./proposal-schemas";
import type {
  ProposalDocument,
  ProposalListResponseDTO,
  ProposalTemplate,
} from "./proposal-types";

export interface ProposalTemplateListDTO {
  items: ProposalTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getProposals(
  params?: Partial<z.input<typeof listProposalsSchema>>,
): Promise<ProposalListResponseDTO> {
  const parsed = listProposalsSchema.parse(params ?? {});
  const searchParams: Record<string, string> = {
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
  };
  if (parsed.search !== undefined) {
    searchParams.search = parsed.search;
  }
  if (parsed.status !== undefined) {
    searchParams.status = parsed.status;
  }
  const res = await api.get(apiPaths.proposals.list, { searchParams });
  return handleApiResponse<ProposalListResponseDTO>(res);
}

export async function getProposalById(id: string): Promise<ProposalDocument> {
  const res = await api.get(apiPaths.proposals.details(id));
  return handleApiResponse<ProposalDocument>(res);
}

export async function postProposal(payload: CreateProposalPayload): Promise<ProposalDocument> {
  const res = await api.post(apiPaths.proposals.create, { json: payload });
  return handleApiResponse<ProposalDocument>(res);
}

export async function putProposal(id: string, payload: UpdateProposalPayload): Promise<ProposalDocument> {
  const res = await api.put(apiPaths.proposals.update(id), { json: payload });
  return handleApiResponse<ProposalDocument>(res);
}

export async function deleteProposal(id: string): Promise<void> {
  const res = await api.delete(apiPaths.proposals.delete(id));
  await handleApiResponse<null>(res);
}

export async function postProposalComplete(id: string): Promise<ProposalDocument> {
  const res = await api.post(apiPaths.proposals.complete(id));
  return handleApiResponse<ProposalDocument>(res);
}

export async function getProposalTemplates(
  params?: Partial<z.input<typeof listProposalTemplatesSchema>>,
): Promise<ProposalTemplateListDTO> {
  const parsed = listProposalTemplatesSchema.parse(params ?? {});
  const searchParams: Record<string, string> = {
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
  };
  if (parsed.search !== undefined) {
    searchParams.search = parsed.search;
  }
  if (parsed.category !== undefined) {
    searchParams.category = parsed.category;
  }
  const res = await api.get(apiPaths.proposalTemplates.list, { searchParams });
  return handleApiResponse<ProposalTemplateListDTO>(res);
}
