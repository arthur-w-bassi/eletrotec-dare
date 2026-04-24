import "server-only";

import { OrderStatus, Prisma } from "@/generated/prisma/client";
import type { OrderItem } from "@/generated/prisma/client";
import { RouteError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma/client";

import type {
  AddOrderItemPayload,
  CreateOrderPayload,
  ListOrdersParams,
  OrderDTO,
  OrderItemDTO,
  OrderListItemDTO,
  OrderStatusValue,
  UpdateOrderPayload,
} from "./order-types";

const orderDetailInclude = {
  items: true,
  customer: true,
} as const;

const orderListInclude = {
  customer: true,
  _count: { select: { items: true } },
} as const;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

export type OrderListRow = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;

export interface ListOrdersResult {
  items: OrderListRow[];
  total: number;
  page: number;
  pageSize: number;
}

function toDecimal12_2(n: number): Prisma.Decimal {
  return new Prisma.Decimal(String(n));
}

function assertOrderStatus(
  status: OrderStatus,
  allowed: readonly OrderStatus[],
  message: string,
): void {
  if (!allowed.includes(status)) {
    throw new RouteError(409, "INVALID_TRANSITION", message);
  }
}

async function ensureCustomerExists(customerId: string): Promise<void> {
  const row = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!row) {
    throw new RouteError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado.");
  }
}

async function recalculateOrderTotals(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { itemTotal: true },
  });
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { discount: true },
  });
  let subtotal = new Prisma.Decimal(0);
  for (const item of items) {
    subtotal = subtotal.plus(item.itemTotal);
  }
  const discount = order.discount;
  const rawTotal = subtotal.minus(discount);
  const zero = new Prisma.Decimal(0);
  const total = rawTotal.gt(zero) ? rawTotal : zero;
  await tx.order.update({
    where: { id: orderId },
    data: { subtotal, total },
  });
}

function buildOrderUpdateData(payload: UpdateOrderPayload): Prisma.OrderUncheckedUpdateInput {
  const data: Prisma.OrderUncheckedUpdateInput = {};

  if (payload.customerId !== undefined) {
    data.customerId = payload.customerId;
  }
  if (payload.notes !== undefined) {
    data.notes = payload.notes;
  }
  if (payload.discount !== undefined) {
    data.discount = toDecimal12_2(payload.discount);
  }

  return data;
}

function buildListWhere(params: ListOrdersParams): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  const q = params.search?.trim();
  if (q) {
    if (/^\d+$/.test(q)) {
      const n = Number.parseInt(q, 10);
      if (Number.isSafeInteger(n)) {
        where.orderNumber = n;
      } else {
        where.id = { in: [] };
      }
    } else {
      where.customer = { name: { contains: q, mode: "insensitive" } };
    }
  }

  return where;
}

function mapOrderItemToDTO(item: OrderItem): OrderItemDTO {
  return {
    id: item.id,
    catalogItemId: item.catalogItemId,
    catalogItemName: item.catalogItemName,
    catalogItemType: item.catalogItemType,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    itemTotal: item.itemTotal.toString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function mapOrderToDTO(order: OrderWithItems): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatusValue,
    customerId: order.customerId,
    customerName: order.customer?.name ?? null,
    notes: order.notes,
    subtotal: order.subtotal.toString(),
    discount: order.discount.toString(),
    total: order.total.toString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(mapOrderItemToDTO),
  };
}

export function mapOrderToListDTO(row: OrderListRow): OrderListItemDTO {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status as OrderStatusValue,
    customerId: row.customerId,
    customerName: row.customer?.name ?? null,
    notes: row.notes,
    subtotal: row.subtotal.toString(),
    discount: row.discount.toString(),
    total: row.total.toString(),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    itemCount: row._count.items,
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
  userId: string,
): Promise<OrderWithItems> {
  if (payload.customerId) {
    await ensureCustomerExists(payload.customerId);
  }

  return prisma.order.create({
    data: {
      status: OrderStatus.DRAFT,
      createdById: userId,
      customerId: payload.customerId ?? null,
      notes: payload.notes ?? null,
      subtotal: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(0),
    },
    include: orderDetailInclude,
  });
}

export async function listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
  const where = buildListWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
      include: orderListInclude,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });
}

export async function updateOrder(id: string, payload: UpdateOrderPayload): Promise<OrderWithItems> {
  const existing = await prisma.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });
  if (!existing) {
    throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
  }
  assertOrderStatus(
    existing.status,
    [OrderStatus.DRAFT],
    "Só é possível alterar pedidos em rascunho.",
  );

  if (payload.customerId !== undefined) {
    await ensureCustomerExists(payload.customerId);
  }

  const data = buildOrderUpdateData(payload);
  if (Object.keys(data).length === 0) {
    return existing;
  }

  const needsRecalc = payload.discount !== undefined;

  if (needsRecalc) {
    return prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data });
      await recalculateOrderTotals(tx, id);
      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderDetailInclude,
      });
    });
  }

  return prisma.order.update({
    where: { id },
    data,
    include: orderDetailInclude,
  });
}

export async function addOrderItem(
  orderId: string,
  payload: AddOrderItemPayload,
): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    assertOrderStatus(
      order.status,
      [OrderStatus.DRAFT],
      "Só é possível adicionar itens a pedidos em rascunho.",
    );

    const catalog = await tx.catalogItem.findUnique({ where: { id: payload.catalogItemId } });
    if (!catalog) {
      throw new RouteError(404, "CATALOG_ITEM_NOT_FOUND", "Item do catálogo não encontrado.");
    }
    if (!catalog.isActive) {
      throw new RouteError(
        422,
        "CATALOG_ITEM_INACTIVE",
        "O item do catálogo está inativo e não pode ser adicionado ao pedido.",
      );
    }

    const quantity = new Prisma.Decimal(String(payload.quantity));
    const unitPrice =
      payload.unitPrice !== undefined
        ? new Prisma.Decimal(String(payload.unitPrice)).toDecimalPlaces(2)
        : catalog.price;
    const itemTotal = quantity.mul(unitPrice).toDecimalPlaces(2);

    await tx.orderItem.create({
      data: {
        orderId,
        catalogItemId: catalog.id,
        catalogItemName: catalog.name,
        catalogItemType: catalog.type,
        quantity,
        unitPrice,
        itemTotal,
      },
    });

    await recalculateOrderTotals(tx, orderId);

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderDetailInclude,
    });
  });
}

export async function removeOrderItem(orderId: string, itemId: string): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    assertOrderStatus(
      order.status,
      [OrderStatus.DRAFT],
      "Só é possível remover itens de pedidos em rascunho.",
    );

    const deleted = await tx.orderItem.deleteMany({
      where: { id: itemId, orderId },
    });
    if (deleted.count === 0) {
      throw new RouteError(404, "NOT_FOUND", "Linha não encontrada.");
    }

    await recalculateOrderTotals(tx, orderId);

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderDetailInclude,
    });
  });
}

export async function confirmOrder(id: string): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });
    if (!order) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    assertOrderStatus(
      order.status,
      [OrderStatus.DRAFT],
      "Só é possível confirmar pedidos em rascunho.",
    );

    if (order.items.length === 0) {
      throw new RouteError(422, "ORDER_EMPTY", "Não é possível confirmar um pedido sem linhas.");
    }
    if (!order.customerId) {
      throw new RouteError(
        422,
        "CUSTOMER_REQUIRED",
        "É necessário associar um cliente para confirmar o pedido.",
      );
    }
    if (!order.customer) {
      throw new RouteError(404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado.");
    }
    if (!order.customer.isActive) {
      throw new RouteError(
        422,
        "CUSTOMER_INACTIVE",
        "O cliente associado está inativo e não pode ser usado neste pedido.",
      );
    }

    await tx.order.update({
      where: { id },
      data: {
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id },
      include: orderDetailInclude,
    });
  });
}

export async function completeOrder(id: string): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    assertOrderStatus(
      order.status,
      [OrderStatus.CONFIRMED],
      "Só é possível finalizar pedidos confirmados.",
    );

    await tx.order.update({
      where: { id },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id },
      include: orderDetailInclude,
    });
  });
}

export async function cancelOrder(id: string): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    assertOrderStatus(
      order.status,
      [OrderStatus.DRAFT, OrderStatus.CONFIRMED],
      "Só é possível cancelar pedidos em rascunho ou confirmados.",
    );

    await tx.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id },
      include: orderDetailInclude,
    });
  });
}
