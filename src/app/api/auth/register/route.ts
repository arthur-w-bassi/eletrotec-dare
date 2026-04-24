import { registerSchema } from "@/domain/auth/auth-types";
import { mapUserToDTO, registerUser } from "@/domain/auth/auth-service";
import { createSession } from "@/lib/auth/session";
import { RouteError } from "@/lib/http/api-error";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";
import { setSessionCookieOnResponse } from "@/lib/storage/secure-cookies";

export const POST = withApiRoute(
  {
    schema: registerSchema,
    csrf: true,
    rateLimit: RATE_LIMITS.register,
  },
  async (ctx) => {
    try {
      const user = await registerUser(ctx.body);
      const { rawToken } = await createSession(
        user.id,
        ctx.ip,
        ctx.userAgent,
      );
      const res = ctx.success(mapUserToDTO(user), { status: 201 });
      setSessionCookieOnResponse(res, rawToken);
      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "DUPLICATE") {
        throw new RouteError(409, "REGISTER_FAILED", "Não foi possível criar a conta.");
      }
      if (e instanceof Error && e.message === "CONFIG_ERROR") {
        throw new RouteError(500, "SERVER_ERROR", "Serviço indisponível.");
      }
      throw e;
    }
  },
);
