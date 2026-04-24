import type { NextRequest } from "next/server";
import { z } from "zod";

import { updateOrderSchema } from "@/domain/order/order-types";
import {
  cancelOrder,
  getOrderById,
  mapOrderToDTO,
  updateOrder,
} from "@/domain/order/order-service";
import { RouteError } from "@/lib/http/api-error";
import { withApiRoute } from "@/lib/http/with-api-route";

const uuidSchema = z.string().uuid("ID inválido");

function parseOrderId(rawId: string): string {
  const parsed = uuidSchema.safeParse(rawId);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "ID inválido";
    throw new RouteError(400, "VALIDATION_ERROR", first);
  }
  return parsed.data;
}

export async function GET(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute({ auth: true }, async (ctx) => {
    const id = parseOrderId(rawId);
    const row = await getOrderById(id);
    if (!row) {
      throw new RouteError(404, "NOT_FOUND", "Pedido não encontrado.");
    }
    return ctx.success(mapOrderToDTO(row));
  })(request);
}

export async function PUT(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute(
    {
      auth: true,
      csrf: true,
      schema: updateOrderSchema,
    },
    async (ctx) => {
      const id = parseOrderId(rawId);
      const row = await updateOrder(id, ctx.body);
      return ctx.success(mapOrderToDTO(row));
    },
  )(request);
}

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute({ auth: true, csrf: true }, async (ctx) => {
    const id = parseOrderId(rawId);
    const row = await cancelOrder(id);
    return ctx.success(mapOrderToDTO(row));
  })(request);
}
