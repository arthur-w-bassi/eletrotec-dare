import type { NextRequest } from "next/server";
import { z } from "zod";

import { updateProposalSchema } from "@/domain/proposal/proposal-schemas";
import {
  deleteProposal,
  getProposalById,
  mapProposalToDTO,
  updateProposal,
} from "@/domain/proposal/proposal-service";
import { RouteError } from "@/lib/http/api-error";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

const uuidSchema = z.string().uuid("ID inválido");

function parseProposalId(rawId: string): string {
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
    const id = parseProposalId(rawId);
    const row = await getProposalById(id);
    if (!row) {
      throw new RouteError(404, "NOT_FOUND", "Proposta não encontrada.");
    }
    return ctx.success(mapProposalToDTO(row));
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
      schema: updateProposalSchema,
      rateLimit: RATE_LIMITS.proposalUpdate,
    },
    async (ctx) => {
      const id = parseProposalId(rawId);
      const row = await updateProposal(id, ctx.body);
      return ctx.success(mapProposalToDTO(row));
    },
  )(request);
}

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute(
    { auth: true, csrf: true, rateLimit: RATE_LIMITS.proposalDelete },
    async (ctx) => {
      const id = parseProposalId(rawId);
      await deleteProposal(id);
      return ctx.success(null);
    },
  )(request);
}
