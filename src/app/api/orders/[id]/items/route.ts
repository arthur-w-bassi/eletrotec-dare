import type { NextRequest } from "next/server";
import { z } from "zod";

import { addOrderItemSchema } from "@/domain/order/order-types";
import { addOrderItem, mapOrderToDTO } from "@/domain/order/order-service";
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

export async function POST(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute(
    {
      auth: true,
      csrf: true,
      schema: addOrderItemSchema,
    },
    async (ctx) => {
      const orderId = parseOrderId(rawId);
      const row = await addOrderItem(orderId, ctx.body);
      return ctx.success(mapOrderToDTO(row));
    },
  )(request);
}
