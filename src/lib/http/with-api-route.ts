import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { ZodSchema, z } from "zod";

import type { AuthUser } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { logService } from "@/lib/logger/log-service";

import type { RateLimitPreset } from "./rate-limit-config";
import { RATE_LIMIT_WINDOW_MS } from "./rate-limit-config";
import { RouteError } from "./api-error";
import type { ApiErrorBody, ApiSuccessBody } from "./route-helpers";
import { getClientIp, jsonError, jsonSuccess } from "./route-helpers";

// ── Rate-limit config accepted by withApiRoute ──────────────────────────

type RateLimitOption =
  | RateLimitPreset
  | (Omit<RateLimitPreset, "windowMs"> & { windowMs?: number });

// ── Route configuration ─────────────────────────────────────────────────

interface RouteConfig<TSchema extends ZodSchema | undefined = undefined> {
  csrf?: boolean;
  rateLimit?: RateLimitOption;
  schema?: TSchema;
  auth?: boolean;
}

// ── Route context injected into the handler ─────────────────────────────

type InferBody<T> = T extends ZodSchema ? z.infer<T> : unknown;

interface RouteContext<TBody = unknown> {
  request: NextRequest;
  ip: string;
  userAgent: string | null;
  body: TBody;
  user: AuthUser;
  success: typeof jsonSuccess;
  error: typeof jsonError;
}

type UnauthRouteContext<TBody = unknown> = Omit<RouteContext<TBody>, "user"> & {
  user: null;
};

type HandlerContext<TConfig extends RouteConfig<ZodSchema | undefined>> =
  TConfig extends { auth: true }
    ? RouteContext<InferBody<TConfig["schema"]>>
    : UnauthRouteContext<InferBody<TConfig["schema"]>>;

type RouteHandler<TConfig extends RouteConfig<ZodSchema | undefined>> = (
  ctx: HandlerContext<TConfig>,
) => Promise<NextResponse<ApiSuccessBody<unknown> | ApiErrorBody>>;

// ── Higher-order function ───────────────────────────────────────────────

export function withApiRoute<
  TSchema extends ZodSchema | undefined = undefined,
  TConfig extends RouteConfig<TSchema> = RouteConfig<TSchema>,
>(
  config: TConfig & RouteConfig<TSchema>,
  handler: RouteHandler<TConfig & RouteConfig<TSchema>>,
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const ip = getClientIp(request);
      const userAgent = request.headers.get("user-agent");

      if (config.csrf && !isMutationOriginAllowed(request)) {
        return jsonError(403, "FORBIDDEN", "Pedido recusado.");
      }

      if (config.rateLimit) {
        const rl = config.rateLimit;
        const windowMs = rl.windowMs ?? RATE_LIMIT_WINDOW_MS;
        const key = `${rl.prefix}:${ip}`;
        if (!consumeRateLimit(key, rl.max, windowMs)) {
          return jsonError(429, "RATE_LIMIT", "Demasiados pedidos. Tenta mais tarde.");
        }
      }

      let body: unknown = undefined;
      if (config.schema) {
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "INVALID_BODY", "Corpo inválido.");
        }

        const parsed = config.schema.safeParse(body);
        if (!parsed.success) {
          const first = parsed.error.issues[0]?.message ?? "Validação falhou";
          return jsonError(400, "VALIDATION_ERROR", first);
        }
        body = parsed.data;
      }

      let user: AuthUser | null = null;
      if (config.auth) {
        const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!token) {
          return jsonError(401, "UNAUTHORIZED", "Sessão necessária.");
        }
        user = await getUserFromSessionToken(token);
        if (!user) {
          return jsonError(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
        }
      }

      const ctx = {
        request,
        ip,
        userAgent,
        body,
        user,
        success: jsonSuccess,
        error: jsonError,
      } as HandlerContext<TConfig & RouteConfig<TSchema>>;

      return await handler(ctx);
    } catch (e) {
      if (e instanceof RouteError) {
        return jsonError(e.status, e.code, e.message);
      }
      logService.error("Erro não tratado na rota", { err: String(e) });
      return jsonError(500, "SERVER_ERROR", "Erro interno.");
    }
  };
}
