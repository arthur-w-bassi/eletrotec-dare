import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { Customer } from "@/generated/prisma/client";
import { RouteError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma/client";

import type {
  CreateCustomerPayload,
  CustomerDTO,
  ListCustomersParams,
  UpdateCustomerPayload,
} from "./customer-types";
import { normalizeDigits } from "./customer-types";

export interface ListCustomersResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

function isDuplicateDocumentError(e: unknown): boolean {
  // Única unique composta além de id no modelo Customer é `document`.
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function rethrowIfDuplicateDocument(e: unknown): void {
  if (isDuplicateDocumentError(e)) {
    throw new RouteError(
      409,
      "DUPLICATE_DOCUMENT",
      "Já existe um cliente com este documento.",
    );
  }
}

function buildListWhere(params: ListCustomersParams): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = {};

  if (!params.includeInactive) {
    where.isActive = true;
  }

  const q = params.search?.trim();
  if (q) {
    const digitTerm = normalizeDigits(q);
    const or: Prisma.CustomerWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
    ];
    if (digitTerm.length > 0) {
      or.push({ document: { contains: digitTerm } });
      or.push({ phone: { contains: digitTerm } });
      or.push({ secondaryPhone: { contains: digitTerm } });
    }
    where.OR = or;
  }

  return where;
}

export function mapCustomerToDTO(entity: Customer): CustomerDTO {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    tradeName: entity.tradeName,
    document: entity.document,
    email: entity.email,
    phone: entity.phone,
    secondaryPhone: entity.secondaryPhone,
    zipCode: entity.zipCode,
    state: entity.state,
    city: entity.city,
    neighborhood: entity.neighborhood,
    street: entity.street,
    number: entity.number,
    complement: entity.complement,
    notes: entity.notes,
    isActive: entity.isActive,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  try {
    return await prisma.customer.create({
      data: {
        type: payload.type,
        name: payload.name,
        tradeName: payload.tradeName,
        document: payload.document,
        email: payload.email,
        phone: payload.phone,
        secondaryPhone: payload.secondaryPhone,
        zipCode: payload.zipCode,
        state: payload.state,
        city: payload.city,
        neighborhood: payload.neighborhood,
        street: payload.street,
        number: payload.number,
        complement: payload.complement,
        notes: payload.notes,
      },
    });
  } catch (e) {
    rethrowIfDuplicateDocument(e);
    throw e;
  }
}

export async function listCustomers(params: ListCustomersParams): Promise<ListCustomersResult> {
  const where = buildListWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return prisma.customer.findUnique({ where: { id } });
}

function buildCustomerUpdateData(payload: UpdateCustomerPayload): Prisma.CustomerUpdateInput {
  const data: Prisma.CustomerUpdateInput = {};

  if (payload.type !== undefined) {
    data.type = payload.type;
  }
  if (payload.name !== undefined) {
    data.name = payload.name;
  }
  if (payload.tradeName !== undefined) {
    data.tradeName = payload.tradeName;
  }
  if (payload.document !== undefined) {
    data.document = payload.document;
  }
  if (payload.email !== undefined) {
    data.email = payload.email;
  }
  if (payload.phone !== undefined) {
    data.phone = payload.phone;
  }
  if (payload.secondaryPhone !== undefined) {
    data.secondaryPhone = payload.secondaryPhone;
  }
  if (payload.zipCode !== undefined) {
    data.zipCode = payload.zipCode;
  }
  if (payload.state !== undefined) {
    data.state = payload.state;
  }
  if (payload.city !== undefined) {
    data.city = payload.city;
  }
  if (payload.neighborhood !== undefined) {
    data.neighborhood = payload.neighborhood;
  }
  if (payload.street !== undefined) {
    data.street = payload.street;
  }
  if (payload.number !== undefined) {
    data.number = payload.number;
  }
  if (payload.complement !== undefined) {
    data.complement = payload.complement;
  }
  if (payload.notes !== undefined) {
    data.notes = payload.notes;
  }

  return data;
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Cliente não encontrado.");
  }

  const data = buildCustomerUpdateData(payload);
  if (Object.keys(data).length === 0) {
    return existing;
  }

  try {
    return await prisma.customer.update({
      where: { id },
      data,
    });
  } catch (e) {
    rethrowIfDuplicateDocument(e);
    throw e;
  }
}

/** TODO: quando existirem pedidos/OS ligados a Customer, consultar essas relações. */
export async function checkCustomerHasDependencies(id: string): Promise<boolean> {
  void id;
  return false;
}

export async function softDeleteCustomer(id: string): Promise<void> {
  const row = await prisma.customer.findUnique({ where: { id } });
  if (!row) {
    throw new RouteError(404, "NOT_FOUND", "Cliente não encontrado.");
  }
  if (!row.isActive) {
    return;
  }

  const hasDeps = await checkCustomerHasDependencies(id);
  if (hasDeps) {
    throw new RouteError(
      409,
      "HAS_DEPENDENCIES",
      "Não é possível desativar este cliente porque existem registos associados.",
    );
  }

  await prisma.customer.update({
    where: { id },
    data: { isActive: false },
  });
}
