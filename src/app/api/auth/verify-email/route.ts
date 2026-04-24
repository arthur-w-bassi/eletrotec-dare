import { verifyEmailSchema } from "@/domain/auth/auth-types";
import { mapUserToDTO, getUserById, verifyEmailWithCode } from "@/domain/auth/auth-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

const GENERIC_FAIL = "Código inválido ou expirado.";

export const POST = withApiRoute(
  {
    schema: verifyEmailSchema,
    csrf: true,
    auth: true,
    rateLimit: RATE_LIMITS.verifyEmail,
  },
  async (ctx) => {
    const result = await verifyEmailWithCode(ctx.user.id, ctx.body);

    if (result === "ok") {
      const fresh = await getUserById(ctx.user.id);
      if (!fresh) {
        return ctx.error(500, "SERVER_ERROR", "Erro interno.");
      }
      return ctx.success({ user: mapUserToDTO(fresh) });
    }

    if (result === "locked") {
      return ctx.error(400, "VERIFY_LOCKED", GENERIC_FAIL);
    }

    return ctx.error(400, "VERIFY_FAILED", GENERIC_FAIL);
  },
);
