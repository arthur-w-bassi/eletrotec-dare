import type { NextRequest } from "next/server";
import { z } from "zod";

import { mapOrderToDTO, removeOrderItem } from "@/domain/order/order-service";
import { RouteError } from "@/lib/http/api-error";
import { withApiRoute } from "@/lib/http/with-api-route";

const uuidSchema = z.string().uuid("ID inválido");

function parseUuid(rawId: string): string {
  const parsed = uuidSchema.safeParse(rawId);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "ID inválido";
    throw new RouteError(400, "VALIDATION_ERROR", first);
  }
  return parsed.data;
}

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: rawOrderId, itemId: rawItemId } = await routeContext.params;
  return withApiRoute({ auth: true, csrf: true }, async (ctx) => {
    const orderId = parseUuid(rawOrderId);
    const itemId = parseUuid(rawItemId);
    const row = await removeOrderItem(orderId, itemId);
    return ctx.success(mapOrderToDTO(row));
  })(request);
}
