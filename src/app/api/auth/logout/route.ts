import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { deleteSessionByRawToken } from "@/lib/auth/session";
import { withApiRoute } from "@/lib/http/with-api-route";
import { logService } from "@/lib/logger/log-service";
import { clearSessionCookieOnResponse } from "@/lib/storage/secure-cookies";

export const POST = withApiRoute({ csrf: true }, async (ctx) => {
  const token = ctx.request.cookies.get(SESSION_COOKIE_NAME)?.value;
  try {
    if (token) {
      await deleteSessionByRawToken(token);
    }
  } catch (e) {
    logService.error("logout falhou", { err: String(e) });
  }

  const res = ctx.success({ ok: true });
  clearSessionCookieOnResponse(res);
  return res;
});
