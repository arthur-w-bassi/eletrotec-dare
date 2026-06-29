import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { ProposalTemplate } from "@/generated/prisma/client";
import { RouteError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma/client";

import { mapPrismaServiceCategoryToUi, mapUiServiceCategoryToPrisma } from "./proposal-category-map";
import type { ListProposalTemplatesParams } from "./proposal-schemas";
import type {
  ProposalTemplate as ProposalTemplateDTO,
  ProposalTemplateScheduleEntry,
} from "./proposal-types";

export interface ListProposalTemplatesResult {
  items: ProposalTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

function buildListWhere(params: ListProposalTemplatesParams): Prisma.ProposalTemplateWhereInput {
  const where: Prisma.ProposalTemplateWhereInput = {
    isActive: true,
  };

  if (params.category) {
    where.category = mapUiServiceCategoryToPrisma(params.category);
  }

  const q = params.search?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function parseSchedule(schedule: Prisma.JsonValue): ProposalTemplateScheduleEntry[] {
  if (!Array.isArray(schedule)) return [];
  return schedule as unknown as ProposalTemplateScheduleEntry[];
}

function parseServiceIds(serviceIds: Prisma.JsonValue): string[] {
  if (!Array.isArray(serviceIds)) return [];
  return serviceIds.filter((id): id is string => typeof id === "string");
}

export function mapProposalTemplateToDTO(template: ProposalTemplate): ProposalTemplateDTO {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    category: mapPrismaServiceCategoryToUi(template.category),
    introduction: template.introduction,
    serviceIds: parseServiceIds(template.serviceIds),
    schedule: parseSchedule(template.schedule),
  };
}

export async function listProposalTemplates(
  params: ListProposalTemplatesParams,
): Promise<ListProposalTemplatesResult> {
  const where = buildListWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.proposalTemplate.findMany({
      where,
      orderBy: { title: "asc" },
      skip,
      take: params.pageSize,
    }),
    prisma.proposalTemplate.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getProposalTemplateById(id: string): Promise<ProposalTemplate | null> {
  return prisma.proposalTemplate.findFirst({
    where: { id, isActive: true },
  });
}

export async function getProposalTemplateByIdOrThrow(id: string): Promise<ProposalTemplate> {
  const template = await getProposalTemplateById(id);
  if (!template) {
    throw new RouteError(404, "NOT_FOUND", "Pré-modelo não encontrado.");
  }
  return template;
}
