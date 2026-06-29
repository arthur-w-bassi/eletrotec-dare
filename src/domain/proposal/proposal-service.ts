import "server-only";

import { ProposalStatus, Prisma } from "@/generated/prisma/client";
import type { ProposalInternalCost, ProposalLineItem } from "@/generated/prisma/client";
import { RouteError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma/client";

import { calculateFinancialSummary } from "./proposal-calculations";
import {
  formatProposalMonthYear,
  formatProposalNumber,
  formatProposalSignatureDate,
} from "./proposal-customer";
import { ELETROTEC_COMPANY } from "./eletrotec-company";
import { normalizeProposal } from "./proposal-normalize";
import type {
  CreateProposalPayload,
  ListProposalsParams,
  UpdateProposalPayload,
} from "./proposal-schemas";
import type {
  ProposalDocument,
  ProposalBlock,
  ProposalListItemDTO,
  ProposalScheduleItem,
  ProposalStatusValue,
} from "./proposal-types";

const proposalDetailInclude = {
  lineItems: { orderBy: { sortOrder: "asc" as const } },
  internalCosts: { orderBy: { sortOrder: "asc" as const } },
  customer: true,
} as const;

const proposalListInclude = {
  lineItems: { select: { quantity: true, unitPrice: true } },
  _count: { select: { lineItems: true } },
} as const;

export type ProposalWithDetails = Prisma.ProposalGetPayload<{
  include: typeof proposalDetailInclude;
}>;

export type ProposalListRow = Prisma.ProposalGetPayload<{
  include: typeof proposalListInclude;
}>;

export interface ListProposalsResult {
  items: ProposalListRow[];
  total: number;
  page: number;
  pageSize: number;
}

function toDecimal12_2(n: number): Prisma.Decimal {
  return new Prisma.Decimal(String(n));
}

function toDecimal12_3(n: number): Prisma.Decimal {
  return new Prisma.Decimal(String(n));
}

function mapStatusToDTO(status: ProposalStatus): ProposalStatusValue {
  return status === ProposalStatus.COMPLETED ? "completed" : "draft";
}

function mapStatusFilterToPrisma(status: ProposalStatusValue): ProposalStatus {
  return status === "completed" ? ProposalStatus.COMPLETED : ProposalStatus.DRAFT;
}

async function ensureCustomerExists(customerId: string): Promise<void> {
  const row = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!row) {
    throw new RouteError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado.");
  }
}

async function validateCatalogItemIds(serviceIds: (string | undefined)[]): Promise<void> {
  const ids = [...new Set(serviceIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return;

  const items = await prisma.catalogItem.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const found = new Set(items.map((item) => item.id));

  for (const id of ids) {
    if (!found.has(id)) {
      throw new RouteError(404, "CATALOG_ITEM_NOT_FOUND", "Serviço do catálogo não encontrado.");
    }
  }
}

function payloadToProposalDocument(payload: CreateProposalPayload | UpdateProposalPayload): ProposalDocument {
  return normalizeProposal({
    status: "draft",
    cover: {
      title: payload.cover.title,
      client: payload.cover.client,
      clientAddress: payload.cover.clientAddress ?? "",
      clientDocument: payload.cover.clientDocument ?? "",
      clientContact: payload.cover.clientContact ?? "",
      customerId: payload.cover.customerId ?? undefined,
      number: payload.cover.number ?? "",
      date: payload.cover.date ?? "",
    },
    introduction: payload.introduction,
    lineItems: payload.lineItems.map((item) => ({
      id: item.id,
      serviceId: item.serviceId ?? "",
      title: item.title,
      description: item.description,
      images: item.images,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
    blocks: payload.blocks as ProposalBlock[],
    sectionOrder: payload.sectionOrder,
    schedule: [],
    notes: payload.notes,
    signature: payload.signature,
    financial: payload.financial,
    internalCosts: payload.internalCosts,
  });
}

function buildHeaderData(
  document: ProposalDocument,
  customerId: string | null,
): Prisma.ProposalUncheckedUpdateInput {
  return {
    customerId,
    coverTitle: document.cover.title,
    coverClient: document.cover.client,
    coverClientAddress: document.cover.clientAddress || null,
    coverClientDocument: document.cover.clientDocument || null,
    coverClientContact: document.cover.clientContact || null,
    introduction: document.introduction,
    notes: document.notes,
    signaturePreparedBy: document.signature.preparedBy,
    signatureDate: document.signature.date,
    discountPercent: toDecimal12_2(document.financial.discountPercent),
    taxPercent: toDecimal12_2(document.financial.taxPercent),
    blocks: document.blocks as Prisma.InputJsonValue,
    sectionOrder: document.sectionOrder
      ? (document.sectionOrder as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    schedule: [] as Prisma.InputJsonValue,
  };
}

function buildLineItemsCreateData(
  proposalId: string,
  lineItems: ProposalDocument["lineItems"],
): Prisma.ProposalLineItemCreateManyInput[] {
  return lineItems.map((item, index) => {
    const unitPrice = toDecimal12_2(item.unitPrice);
    const quantity = toDecimal12_3(item.qty);
    const itemTotal = quantity.mul(unitPrice).toDecimalPlaces(2);

    return {
      id: item.id,
      proposalId,
      catalogItemId: item.serviceId || null,
      title: item.title,
      description: item.description,
      images: item.images as Prisma.InputJsonValue,
      quantity,
      unitPrice,
      itemTotal,
      sortOrder: index,
    };
  });
}

function buildInternalCostsCreateData(
  proposalId: string,
  costs: ProposalDocument["internalCosts"],
): Prisma.ProposalInternalCostCreateManyInput[] {
  return costs.map((cost, index) => ({
    id: cost.id,
    proposalId,
    description: cost.description,
    amount: toDecimal12_2(cost.amount),
    sortOrder: index,
  }));
}

function mapLineItemToDTO(item: ProposalLineItem): ProposalDocument["lineItems"][number] {
  return {
    id: item.id,
    serviceId: item.catalogItemId ?? "",
    title: item.title,
    description: item.description,
    images: (item.images as string[]) ?? [],
    qty: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  };
}

function mapInternalCostToDTO(
  cost: ProposalInternalCost,
): ProposalDocument["internalCosts"][number] {
  return {
    id: cost.id,
    description: cost.description,
    amount: Number(cost.amount),
  };
}

function parseBlocks(blocks: Prisma.JsonValue): ProposalBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks as ProposalBlock[];
}

function parseSectionOrder(sectionOrder: Prisma.JsonValue | null): string[] | undefined {
  if (!sectionOrder || !Array.isArray(sectionOrder)) return undefined;
  return sectionOrder as string[];
}

export function mapProposalToDTO(proposal: ProposalWithDetails): ProposalDocument {
  return normalizeProposal({
    id: proposal.id,
    status: mapStatusToDTO(proposal.status),
    cover: {
      title: proposal.coverTitle,
      client: proposal.coverClient,
      clientAddress: proposal.coverClientAddress ?? "",
      clientDocument: proposal.coverClientDocument ?? "",
      clientContact: proposal.coverClientContact ?? "",
      customerId: proposal.customerId ?? undefined,
      number: formatProposalNumber(proposal.proposalNumber, proposal.createdAt),
      date: proposal.coverDate,
    },
    introduction: proposal.introduction,
    lineItems: proposal.lineItems.map(mapLineItemToDTO),
    blocks: parseBlocks(proposal.blocks),
    sectionOrder: parseSectionOrder(proposal.sectionOrder),
    schedule: (proposal.schedule as unknown as ProposalScheduleItem[]) ?? [],
    notes: proposal.notes,
    signature: {
      preparedBy: proposal.signaturePreparedBy,
      date: proposal.signatureDate,
    },
    financial: {
      discountPercent: Number(proposal.discountPercent),
      taxPercent: Number(proposal.taxPercent),
    },
    internalCosts: proposal.internalCosts.map(mapInternalCostToDTO),
    createdAt: proposal.createdAt.toISOString(),
    updatedAt: proposal.updatedAt.toISOString(),
  });
}

export function mapProposalToListDTO(row: ProposalListRow): ProposalListItemDTO {
  const lineItems = row.lineItems.map((item) => ({
    id: "",
    serviceId: "",
    title: "",
    description: "",
    images: [] as string[],
    qty: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));

  const { grandTotal } = calculateFinancialSummary({
    status: mapStatusToDTO(row.status),
    cover: {
      title: row.coverTitle,
      client: row.coverClient,
      number: formatProposalNumber(row.proposalNumber, row.createdAt),
      date: row.coverDate,
    },
    introduction: "",
    lineItems,
    blocks: [],
    schedule: [],
    notes: "",
    signature: { preparedBy: "", date: "" },
    financial: {
      discountPercent: Number(row.discountPercent),
      taxPercent: Number(row.taxPercent),
    },
    internalCosts: [],
  });

  return {
    id: row.id,
    number: formatProposalNumber(row.proposalNumber, row.createdAt),
    title: row.coverTitle,
    client: row.coverClient,
    status: mapStatusToDTO(row.status),
    serviceCount: row._count.lineItems,
    grandTotal,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildListWhere(params: ListProposalsParams): Prisma.ProposalWhereInput {
  const where: Prisma.ProposalWhereInput = {};

  if (params.status) {
    where.status = mapStatusFilterToPrisma(params.status);
  }

  const q = params.search?.trim();
  if (q) {
    const prMatch = /^PR-(\d{4})-(\d+)$/i.exec(q);
    if (prMatch) {
      where.proposalNumber = Number.parseInt(prMatch[2]!, 10);
    } else if (/^\d+$/.test(q)) {
      const n = Number.parseInt(q, 10);
      if (Number.isSafeInteger(n)) {
        where.proposalNumber = n;
      } else {
        where.id = { in: [] };
      }
    } else {
      where.OR = [
        { coverTitle: { contains: q, mode: "insensitive" } },
        { coverClient: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

async function persistProposalDocument(
  tx: Prisma.TransactionClient,
  proposalId: string,
  document: ProposalDocument,
): Promise<void> {
  const customerId = document.cover.customerId ?? null;

  await tx.proposalLineItem.deleteMany({ where: { proposalId } });
  await tx.proposalInternalCost.deleteMany({ where: { proposalId } });

  await tx.proposal.update({
    where: { id: proposalId },
    data: buildHeaderData(document, customerId),
  });

  const lineItems = buildLineItemsCreateData(proposalId, document.lineItems);
  if (lineItems.length > 0) {
    await tx.proposalLineItem.createMany({ data: lineItems });
  }

  const internalCosts = buildInternalCostsCreateData(proposalId, document.internalCosts);
  if (internalCosts.length > 0) {
    await tx.proposalInternalCost.createMany({ data: internalCosts });
  }
}

export async function createProposal(
  payload: CreateProposalPayload,
  userId: string,
): Promise<ProposalWithDetails> {
  const document = payloadToProposalDocument(payload);
  const customerId = document.cover.customerId ?? null;

  if (customerId) {
    await ensureCustomerExists(customerId);
  }

  await validateCatalogItemIds(document.lineItems.map((item) => item.serviceId || undefined));

  const now = new Date();
  const coverDate = formatProposalMonthYear(now);
  const signatureDate = formatProposalSignatureDate(now);

  document.cover.date = coverDate;
  document.signature.preparedBy = document.signature.preparedBy || ELETROTEC_COMPANY.name;
  document.signature.date = document.signature.date || signatureDate;

  return prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.create({
      data: {
        status: ProposalStatus.DRAFT,
        createdById: userId,
        customerId,
        coverTitle: document.cover.title,
        coverClient: document.cover.client,
        coverClientAddress: document.cover.clientAddress || null,
        coverClientDocument: document.cover.clientDocument || null,
        coverClientContact: document.cover.clientContact || null,
        coverDate,
        introduction: document.introduction,
        notes: document.notes,
        signaturePreparedBy: document.signature.preparedBy,
        signatureDate: document.signature.date,
        discountPercent: toDecimal12_2(document.financial.discountPercent),
        taxPercent: toDecimal12_2(document.financial.taxPercent),
        blocks: document.blocks as Prisma.InputJsonValue,
        sectionOrder: document.sectionOrder
          ? (document.sectionOrder as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        schedule: [] as Prisma.InputJsonValue,
      },
    });

    const lineItems = buildLineItemsCreateData(proposal.id, document.lineItems);
    if (lineItems.length > 0) {
      await tx.proposalLineItem.createMany({ data: lineItems });
    }

    const internalCosts = buildInternalCostsCreateData(proposal.id, document.internalCosts);
    if (internalCosts.length > 0) {
      await tx.proposalInternalCost.createMany({ data: internalCosts });
    }

    return tx.proposal.findUniqueOrThrow({
      where: { id: proposal.id },
      include: proposalDetailInclude,
    });
  });
}

export async function listProposals(params: ListProposalsParams): Promise<ListProposalsResult> {
  const where = buildListWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
      include: proposalListInclude,
    }),
    prisma.proposal.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getProposalById(id: string): Promise<ProposalWithDetails | null> {
  return prisma.proposal.findUnique({
    where: { id },
    include: proposalDetailInclude,
  });
}

export async function updateProposal(
  id: string,
  payload: UpdateProposalPayload,
): Promise<ProposalWithDetails> {
  const existing = await prisma.proposal.findUnique({ where: { id } });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Proposta não encontrada.");
  }

  const document = payloadToProposalDocument(payload);
  const customerId = document.cover.customerId ?? null;

  if (customerId) {
    await ensureCustomerExists(customerId);
  }

  await validateCatalogItemIds(document.lineItems.map((item) => item.serviceId || undefined));

  return prisma.$transaction(async (tx) => {
    await persistProposalDocument(tx, id, document);
    return tx.proposal.findUniqueOrThrow({
      where: { id },
      include: proposalDetailInclude,
    });
  });
}

export async function completeProposal(id: string): Promise<ProposalWithDetails> {
  const existing = await prisma.proposal.findUnique({ where: { id } });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Proposta não encontrada.");
  }

  if (existing.status === ProposalStatus.COMPLETED) {
    return prisma.proposal.findUniqueOrThrow({
      where: { id },
      include: proposalDetailInclude,
    });
  }

  if (existing.status !== ProposalStatus.DRAFT) {
    throw new RouteError(
      409,
      "INVALID_TRANSITION",
      "Só é possível concluir propostas em rascunho.",
    );
  }

  await prisma.proposal.update({
    where: { id },
    data: {
      status: ProposalStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return prisma.proposal.findUniqueOrThrow({
    where: { id },
    include: proposalDetailInclude,
  });
}

export async function deleteProposal(id: string): Promise<void> {
  const existing = await prisma.proposal.findUnique({ where: { id } });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Proposta não encontrada.");
  }

  if (existing.status !== ProposalStatus.DRAFT) {
    throw new RouteError(
      409,
      "INVALID_STATUS",
      "Só é possível excluir propostas em rascunho.",
    );
  }

  await prisma.proposal.delete({ where: { id } });
}
