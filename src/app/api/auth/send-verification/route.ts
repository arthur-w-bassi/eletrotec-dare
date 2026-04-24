import { sendEmailVerification } from "@/domain/auth/auth-service";
import { RouteError } from "@/lib/http/api-error";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";

export const POST = withApiRoute(
  {
    csrf: true,
    auth: true,
    rateLimit: RATE_LIMITS.sendVerification,
  },
  async (ctx) => {
    try {
      await sendEmailVerification(ctx.user.id);
      return ctx.success({ ok: true });
    } catch (e) {
      if (e instanceof Error && e.message === "NOT_FOUND") {
        throw new RouteError(404, "NOT_FOUND", "Utilizador não encontrado.");
      }
      throw e;
    }
  },
);
