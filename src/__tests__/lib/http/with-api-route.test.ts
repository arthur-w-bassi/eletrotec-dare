import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("@/lib/auth/session", () => ({
  createSession: vi.fn(),
  getUserFromSessionToken: vi.fn(),
  deleteSessionByRawToken: vi.fn(),
  deleteAllSessionsForUser: vi.fn(),
}));
vi.mock("@/lib/security/csrf", () => ({
  isMutationOriginAllowed: vi.fn(() => true),
}));
vi.mock("@/lib/security/rate-limiter", () => ({
  consumeRateLimit: vi.fn(() => true),
}));
vi.mock("@/lib/logger/log-service", () => ({
  logService: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { withApiRoute } from "@/lib/http/with-api-route";
import { RouteError } from "@/lib/http/api-error";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { logService } from "@/lib/logger/log-service";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser } from "../../helpers/mock-data";

const testSchema = z.object({ name: z.string().min(1, "Nome obrigatório") });

function successHandler() {
  return vi.fn().mockImplementation((ctx: { success: (...args: unknown[]) => unknown }) =>
    ctx.success({ ok: true }),
  );
}

describe("withApiRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("CSRF", () => {
    it("bloqueia pedido quando csrf: true e origin inválida", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);
      const handler = successHandler();
      const route = withApiRoute({ csrf: true }, handler);

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe("FORBIDDEN");
      expect(handler).not.toHaveBeenCalled();
    });

    it("permite pedido quando csrf: false", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);
      const handler = successHandler();
      const route = withApiRoute({}, handler);

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(200);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
    it("bloqueia quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);
      const handler = successHandler();
      const route = withApiRoute(
        { rateLimit: { prefix: "test", max: 5, windowMs: 60_000 } },
        handler,
      );

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error.code).toBe("RATE_LIMIT");
      expect(handler).not.toHaveBeenCalled();
    });

    it("chama consumeRateLimit com key baseada em IP", async () => {
      const handler = successHandler();
      const route = withApiRoute(
        { rateLimit: { prefix: "test", max: 5, windowMs: 60_000 } },
        handler,
      );

      const req = createTestRequest("POST", "/api/test", {
        headers: { "x-forwarded-for": "1.2.3.4" },
      });
      await route(req);

      expect(consumeRateLimit).toHaveBeenCalledWith("test:1.2.3.4", 5, 60_000);
    });
  });

  describe("validação de body (Zod)", () => {
    it("retorna 400 INVALID_BODY quando JSON é inválido", async () => {
      const handler = successHandler();
      const route = withApiRoute({ schema: testSchema }, handler);

      const req = createTestRequest("POST", "/api/test");
      // sem body = json() falha
      const res = await route(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("INVALID_BODY");
      expect(handler).not.toHaveBeenCalled();
    });

    it("retorna 400 VALIDATION_ERROR quando schema falha", async () => {
      const handler = successHandler();
      const route = withApiRoute({ schema: testSchema }, handler);

      const req = createTestRequest("POST", "/api/test", { body: { name: "" } });
      const res = await route(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Nome obrigatório");
      expect(handler).not.toHaveBeenCalled();
    });

    it("passa dados validados ao handler via ctx.body", async () => {
      const handler = vi.fn().mockImplementation((ctx: { body: unknown; success: (...args: unknown[]) => unknown }) =>
        ctx.success(ctx.body),
      );
      const route = withApiRoute({ schema: testSchema }, handler);

      const req = createTestRequest("POST", "/api/test", { body: { name: "João" } });
      const res = await route(req);
      const resBody = await res.json();

      expect(res.status).toBe(200);
      expect(resBody.data).toEqual({ name: "João" });
    });
  });

  describe("autenticação (auth: true)", () => {
    it("retorna 401 quando cookie de sessão ausente", async () => {
      const handler = successHandler();
      const route = withApiRoute({ auth: true }, handler);

      const req = createTestRequest("GET", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
      expect(handler).not.toHaveBeenCalled();
    });

    it("retorna 401 quando sessão é inválida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(null);
      const handler = successHandler();
      const route = withApiRoute({ auth: true }, handler);

      const req = createTestRequest("GET", "/api/test", {
        cookies: { et_session: "invalid-token" },
      });
      const res = await route(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.message).toBe("Sessão inválida ou expirada.");
      expect(handler).not.toHaveBeenCalled();
    });

    it("injeta user no contexto quando sessão válida", async () => {
      const mockUser = createMockUser();
      vi.mocked(getUserFromSessionToken).mockResolvedValue(mockUser as never);
      const handler = vi.fn().mockImplementation(
        (ctx: { user: { id: string }; success: (...args: unknown[]) => unknown }) =>
          ctx.success({ userId: ctx.user.id }),
      );
      const route = withApiRoute({ auth: true }, handler);

      const req = createTestRequest("GET", "/api/test", {
        cookies: { et_session: "valid-token" },
      });
      const res = await route(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.userId).toBe("user-id-1");
    });
  });

  describe("error boundary", () => {
    it("captura RouteError e retorna resposta adequada", async () => {
      const handler = vi.fn().mockRejectedValue(
        new RouteError(409, "CONFLICT", "Recurso já existe"),
      );
      const route = withApiRoute({}, handler);

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error.code).toBe("CONFLICT");
      expect(body.error.message).toBe("Recurso já existe");
    });

    it("captura erro genérico, loga e retorna 500", async () => {
      const handler = vi.fn().mockRejectedValue(new Error("DB connection failed"));
      const route = withApiRoute({}, handler);

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.code).toBe("SERVER_ERROR");
      expect(logService.error).toHaveBeenCalledWith(
        "Erro não tratado na rota",
        expect.objectContaining({ err: expect.stringContaining("DB connection failed") }),
      );
    });
  });

  describe("contexto (ip, userAgent)", () => {
    it("extrai IP do header x-forwarded-for", async () => {
      const handler = vi.fn().mockImplementation(
        (ctx: { ip: string; success: (...args: unknown[]) => unknown }) =>
          ctx.success({ ip: ctx.ip }),
      );
      const route = withApiRoute({}, handler);

      const req = createTestRequest("GET", "/api/test", {
        headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.1" },
      });
      const res = await route(req);
      const body = await res.json();

      expect(body.data.ip).toBe("10.0.0.1");
    });

    it("extrai user-agent do header", async () => {
      const handler = vi.fn().mockImplementation(
        (ctx: { userAgent: string | null; success: (...args: unknown[]) => unknown }) =>
          ctx.success({ ua: ctx.userAgent }),
      );
      const route = withApiRoute({}, handler);

      const req = createTestRequest("GET", "/api/test", {
        headers: { "user-agent": "TestBrowser/1.0" },
      });
      const res = await route(req);
      const body = await res.json();

      expect(body.data.ua).toBe("TestBrowser/1.0");
    });
  });

  describe("ordem do pipeline", () => {
    it("executa CSRF antes de rate limit", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);
      const handler = successHandler();
      const route = withApiRoute(
        { csrf: true, rateLimit: { prefix: "t", max: 1, windowMs: 1000 } },
        handler,
      );

      const req = createTestRequest("POST", "/api/test");
      const res = await route(req);

      expect(res.status).toBe(403);
      expect(consumeRateLimit).not.toHaveBeenCalled();
    });

    it("executa rate limit antes de parse do body", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);
      const handler = successHandler();
      const route = withApiRoute(
        { schema: testSchema, rateLimit: { prefix: "t", max: 1, windowMs: 1000 } },
        handler,
      );

      const req = createTestRequest("POST", "/api/test", { body: { name: "test" } });
      const res = await route(req);

      expect(res.status).toBe(429);
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
