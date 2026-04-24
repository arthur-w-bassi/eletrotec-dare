import { forgotPasswordSchema } from "@/domain/auth/auth-types";
import { requestPasswordReset } from "@/domain/auth/auth-service";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";
import { logService } from "@/lib/logger/log-service";

const GENERIC_MSG = "Se o email existir na nossa base, enviámos instruções.";

export const POST = withApiRoute(
  {
    schema: forgotPasswordSchema,
    csrf: true,
    rateLimit: RATE_LIMITS.forgotPassword,
  },
  async (ctx) => {
    try {
      await requestPasswordReset(ctx.body);
    } catch (e) {
      logService.error("forgot-password falhou", { err: String(e) });
    }

    return ctx.success({ message: GENERIC_MSG });
  },
);
