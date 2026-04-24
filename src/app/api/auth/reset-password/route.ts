import { resetPasswordSchema } from "@/domain/auth/auth-types";
import { resetPasswordWithToken } from "@/domain/auth/auth-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export const POST = withApiRoute(
  {
    schema: resetPasswordSchema,
    csrf: true,
    rateLimit: RATE_LIMITS.resetPassword,
  },
  async (ctx) => {
    const ok = await resetPasswordWithToken(ctx.body);
    if (!ok) {
      return ctx.error(400, "RESET_FAILED", "Link inválido ou expirado.");
    }
    return ctx.success({ ok: true });
  },
);
