import { loginSchema } from "@/domain/auth/auth-types";
import { loginUser, mapUserToDTO } from "@/domain/auth/auth-service";
import { createSession } from "@/lib/auth/session";
import { RATE_LIMITS } from "@/lib/http/rate-limit-config";
import { withApiRoute } from "@/lib/http/with-api-route";
import { setSessionCookieOnResponse } from "@/lib/storage/secure-cookies";

export const POST = withApiRoute(
  {
    schema: loginSchema,
    csrf: true,
    rateLimit: RATE_LIMITS.login,
  },
  async (ctx) => {
    const user = await loginUser(ctx.body);
    if (!user) {
      return ctx.error(401, "AUTH_FAILED", "Credenciais inválidas.");
    }

    const { rawToken } = await createSession(
      user.id,
      ctx.ip,
      ctx.userAgent,
    );
    const res = ctx.success(mapUserToDTO(user));
    setSessionCookieOnResponse(res, rawToken);
    return res;
  },
);
