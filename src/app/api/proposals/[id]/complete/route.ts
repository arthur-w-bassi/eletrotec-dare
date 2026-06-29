import type { NextRequest } from "next/server";
import { z } from "zod";

import { completeProposalSchema } from "@/domain/proposal/proposal-schemas";
import { completeProposal, mapProposalToDTO } from "@/domain/proposal/proposal-service";
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

export async function POST(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await routeContext.params;
  return withApiRoute(
    {
      auth: true,
      csrf: true,
      schema: completeProposalSchema,
      rateLimit: RATE_LIMITS.proposalComplete,
    },
    async (ctx) => {
      const id = parseProposalId(rawId);
      const row = await completeProposal(id);
      return ctx.success(mapProposalToDTO(row));
    },
  )(request);
}
