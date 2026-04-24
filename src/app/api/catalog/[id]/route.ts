import type { NextRequest } from "next/server";
import { z } from "zod";

import { updateCatalogItemSchema } from "@/domain/catalog/catalog-types";
import {
  getCatalogItemById,
  mapCatalogItemToDTO,
  softDeleteCatalogItem,
  updateCatalogItem,
} from "@/domain/catalog/catalog-service";
import { RouteError } from "@/lib/http/api-error";
import { withApiRoute } from "@/lib/http/with-api-route";

const uuidSchema = z.string().uuid("ID inválido");

function parseCatalogItemId(rawId: string): string {
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
    const id = parseCatalogItemId(rawId);
    const row = await getCatalogItemById(id);
    if (!row) {
      throw new RouteError(404, "NOT_FOUND", "Item não encontrado.");
    }
    return ctx.success(mapCatalogItemToDTO(row));
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
      schema: updateCatalogItemSchema,
    },
    async (ctx) => {
      const id = parseCatalogItemId(rawId);
      const row = await updateCatalogItem(id, ctx.body);
      return ctx.success(mapCatalogItemToDTO(row));
    },
  )(request);
}

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute({ auth: true, csrf: true }, async (ctx) => {
    const id = parseCatalogItemId(rawId);
    await softDeleteCatalogItem(id);
    return ctx.success(null);
  })(request);
}
