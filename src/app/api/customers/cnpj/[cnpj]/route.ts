import type { NextRequest } from "next/server";

import { lookupCnpj } from "@/lib/integrations/brasil-api";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export async function GET(
  request: NextRequest,
  routeContext: { params: Promise<{ cnpj: string }> },
) {
  const { cnpj } = await routeContext.params;
  return withApiRoute(
    {
      auth: true,
      rateLimit: RATE_LIMITS.cnpjLookup,
    },
    async (ctx) => {
      const data = await lookupCnpj(cnpj);
      return ctx.success(data);
    },
  )(request);
}
