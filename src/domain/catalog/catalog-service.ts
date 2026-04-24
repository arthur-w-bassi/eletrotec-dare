import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { CatalogItem } from "@/generated/prisma/client";
import { RouteError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma/client";

import type {
  CatalogItemDTO,
  CreateCatalogItemPayload,
  ListCatalogItemsParams,
  UpdateCatalogItemPayload,
} from "./catalog-types";

export interface ListCatalogItemsResult {
  items: CatalogItem[];
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

function isDuplicateBarcodeError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function rethrowIfDuplicateBarcode(e: unknown): void {
  if (isDuplicateBarcodeError(e)) {
    throw new RouteError(
      409,
      "DUPLICATE_BARCODE",
      "Já existe um item com este código de barras.",
    );
  }
}

function buildListWhere(params: ListCatalogItemsParams): Prisma.CatalogItemWhereInput {
  const where: Prisma.CatalogItemWhereInput = {};

  if (!params.includeInactive) {
    where.isActive = true;
  }

  if (params.type) {
    where.type = params.type;
  }

  const q = params.search?.trim();
  if (q) {
    const or: Prisma.CatalogItemWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
    if (/^\d+$/.test(q)) {
      or.push({ barcode: { contains: q } });
    }
    where.OR = or;
  }

  return where;
}

function buildCatalogItemUpdateData(
  existing: CatalogItem,
  payload: UpdateCatalogItemPayload,
): Prisma.CatalogItemUpdateInput {
  const data: Prisma.CatalogItemUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }
  if (payload.description !== undefined) {
    data.description = payload.description;
  }
  if (payload.price !== undefined) {
    data.price = toDecimal12_2(payload.price);
  }

  if (existing.type === "PRODUCT") {
    if (payload.costPrice !== undefined) {
      data.costPrice = toDecimal12_2(payload.costPrice);
    }
    if (payload.stockQuantity !== undefined) {
      data.stockQuantity = toDecimal12_3(payload.stockQuantity);
    }
    if (payload.unit !== undefined) {
      data.unit = payload.unit;
    }
    if (payload.barcode !== undefined) {
      data.barcode = payload.barcode;
    }
  }

  if (existing.type === "SERVICE") {
    if (payload.estimatedDurationMinutes !== undefined) {
      data.estimatedDurationMinutes = payload.estimatedDurationMinutes;
    }
  }

  return data;
}

export function mapCatalogItemToDTO(entity: CatalogItem): CatalogItemDTO {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    description: entity.description,
    price: entity.price.toString(),
    costPrice: entity.costPrice?.toString() ?? null,
    stockQuantity: entity.stockQuantity?.toString() ?? null,
    unit: entity.unit ?? null,
    barcode: entity.barcode,
    estimatedDurationMinutes: entity.estimatedDurationMinutes,
    isActive: entity.isActive,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export async function createCatalogItem(payload: CreateCatalogItemPayload): Promise<CatalogItem> {
  try {
    if (payload.type === "PRODUCT") {
      return await prisma.catalogItem.create({
        data: {
          type: payload.type,
          name: payload.name,
          description: payload.description ?? null,
          price: toDecimal12_2(payload.price),
          costPrice: toDecimal12_2(payload.costPrice!),
          stockQuantity: toDecimal12_3(payload.stockQuantity!),
          unit: payload.unit!,
          barcode: payload.barcode ?? null,
          estimatedDurationMinutes: null,
        },
      });
    }

    return await prisma.catalogItem.create({
      data: {
        type: payload.type,
        name: payload.name,
        description: payload.description ?? null,
        price: toDecimal12_2(payload.price),
        costPrice: null,
        stockQuantity: null,
        unit: null,
        barcode: null,
        estimatedDurationMinutes: payload.estimatedDurationMinutes ?? null,
      },
    });
  } catch (e) {
    rethrowIfDuplicateBarcode(e);
    throw e;
  }
}

export async function listCatalogItems(
  params: ListCatalogItemsParams,
): Promise<ListCatalogItemsResult> {
  const where = buildListWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.catalogItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
    }),
    prisma.catalogItem.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getCatalogItemById(id: string): Promise<CatalogItem | null> {
  return prisma.catalogItem.findUnique({ where: { id } });
}

export async function updateCatalogItem(
  id: string,
  payload: UpdateCatalogItemPayload,
): Promise<CatalogItem> {
  const existing = await prisma.catalogItem.findUnique({ where: { id } });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Item não encontrado.");
  }

  const data = buildCatalogItemUpdateData(existing, payload);
  if (Object.keys(data).length === 0) {
    return existing;
  }

  try {
    return await prisma.catalogItem.update({
      where: { id },
      data,
    });
  } catch (e) {
    rethrowIfDuplicateBarcode(e);
    throw e;
  }
}

/** Verdadeiro se existir pelo menos uma linha de pedido (`OrderItem`) referenciando o item. */
export async function checkCatalogItemHasDependencies(id: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: { catalogItemId: id },
  });
  return count > 0;
}

export async function softDeleteCatalogItem(id: string): Promise<void> {
  const row = await prisma.catalogItem.findUnique({ where: { id } });
  if (!row) {
    throw new RouteError(404, "NOT_FOUND", "Item não encontrado.");
  }
  if (!row.isActive) {
    return;
  }

  const hasDeps = await checkCatalogItemHasDependencies(id);
  if (hasDeps) {
    throw new RouteError(
      409,
      "HAS_DEPENDENCIES",
      "Não é possível desativar este item porque existem registos associados.",
    );
  }

  await prisma.catalogItem.update({
    where: { id },
    data: { isActive: false },
  });
}
