import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  resetPasswordWithToken: vi.fn(),
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

import { POST } from "@/app/api/auth/reset-password/route";
import { resetPasswordWithToken } from "@/domain/auth/auth-service";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { createTestRequest } from "../../helpers/request-factory";

const validPayload = {
  token: "a".repeat(64),
  userId: "550e8400-e29b-41d4-a716-446655440000",
  newPassword: "NewPass1!",
};

function postReset(body?: unknown) {
  return createTestRequest("POST", "/api/auth/reset-password", { body });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 quando reset bem sucedido", async () => {
      vi.mocked(resetPasswordWithToken).mockResolvedValue(true as never);

      const res = await POST(postReset(validPayload));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual({ ok: true });
    });
  });

  describe("erro", () => {
    it("retorna 400 INVALID_BODY quando corpo não é JSON", async () => {
      const req = createTestRequest("POST", "/api/auth/reset-password");
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("retorna 400 VALIDATION_ERROR quando token vazio", async () => {
      const res = await POST(postReset({ ...validPayload, token: "" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando userId não é UUID", async () => {
      const res = await POST(postReset({ ...validPayload, userId: "not-uuid" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando password fraca", async () => {
      const res = await POST(postReset({ ...validPayload, newPassword: "weak" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 RESET_FAILED quando token inválido ou expirado", async () => {
      vi.mocked(resetPasswordWithToken).mockResolvedValue(false as never);

      const res = await POST(postReset(validPayload));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("RESET_FAILED");
    });

    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postReset(validPayload));

      expect(res.status).toBe(403);
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postReset(validPayload));

      expect(res.status).toBe(429);
    });

    it("retorna 500 quando erro interno", async () => {
      vi.mocked(resetPasswordWithToken).mockRejectedValue(new Error("DB fail"));

      const res = await POST(postReset(validPayload));

      expect(res.status).toBe(500);
      expect((await res.json()).error.code).toBe("SERVER_ERROR");
    });
  });

  describe("lógica de negócio", () => {
    it("passa payload validado ao resetPasswordWithToken", async () => {
      vi.mocked(resetPasswordWithToken).mockResolvedValue(true as never);

      await POST(postReset(validPayload));

      expect(resetPasswordWithToken).toHaveBeenCalledWith(validPayload);
    });
  });
});
