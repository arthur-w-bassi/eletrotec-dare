import type { NextRequest } from "next/server";
import { z } from "zod";

import { updateCustomerSchema } from "@/domain/customer/customer-types";
import {
  getCustomerById,
  mapCustomerToDTO,
  softDeleteCustomer,
  updateCustomer,
} from "@/domain/customer/customer-service";
import { RouteError } from "@/lib/http/api-error";
import { withApiRoute } from "@/lib/http/with-api-route";

const uuidSchema = z.string().uuid("ID inválido");

function parseCustomerId(rawId: string): string {
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
    const id = parseCustomerId(rawId);
    const row = await getCustomerById(id);
    if (!row) {
      throw new RouteError(404, "NOT_FOUND", "Cliente não encontrado.");
    }
    return ctx.success(mapCustomerToDTO(row));
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
      schema: updateCustomerSchema,
    },
    async (ctx) => {
      const id = parseCustomerId(rawId);
      const row = await updateCustomer(id, ctx.body);
      return ctx.success(mapCustomerToDTO(row));
    },
  )(request);
}

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute({ auth: true, csrf: true }, async (ctx) => {
    const id = parseCustomerId(rawId);
    await softDeleteCustomer(id);
    return ctx.success(null);
  })(request);
}
