import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  requestPasswordReset: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  createSession: vi.fn(),
  getUserFromSessionToken: vi.fn(),
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

import { POST } from "@/app/api/auth/forgot-password/route";
import { requestPasswordReset } from "@/domain/auth/auth-service";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { logService } from "@/lib/logger/log-service";
import { createTestRequest } from "../../helpers/request-factory";

const GENERIC_MSG = "Se o email existir na nossa base, enviámos instruções.";

function postForgot(body?: unknown) {
  return createTestRequest("POST", "/api/auth/forgot-password", { body });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 com mensagem genérica (email existente)", async () => {
      vi.mocked(requestPasswordReset).mockResolvedValue(undefined);

      const res = await POST(postForgot({ email: "exists@example.com" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.message).toBe(GENERIC_MSG);
      expect(requestPasswordReset).toHaveBeenCalledWith({ email: "exists@example.com" });
    });

    it("retorna 200 com mesma mensagem genérica (email inexistente)", async () => {
      vi.mocked(requestPasswordReset).mockResolvedValue(undefined);

      const res = await POST(postForgot({ email: "noone@example.com" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.message).toBe(GENERIC_MSG);
    });
  });

  describe("erro", () => {
    it("retorna 400 INVALID_BODY quando corpo não é JSON", async () => {
      const req = createTestRequest("POST", "/api/auth/forgot-password");
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("retorna 400 VALIDATION_ERROR quando email inválido", async () => {
      const res = await POST(postForgot({ email: "not-email" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postForgot({ email: "test@example.com" }));

      expect(res.status).toBe(403);
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postForgot({ email: "test@example.com" }));

      expect(res.status).toBe(429);
    });
  });

  describe("lógica de negócio", () => {
    it("loga erro mas retorna sucesso quando serviço falha (não revela info)", async () => {
      vi.mocked(requestPasswordReset).mockRejectedValue(new Error("SMTP down"));

      const res = await POST(postForgot({ email: "test@example.com" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.message).toBe(GENERIC_MSG);
      expect(logService.error).toHaveBeenCalledWith(
        "forgot-password falhou",
        expect.objectContaining({ err: expect.any(String) }),
      );
    });
  });
});
