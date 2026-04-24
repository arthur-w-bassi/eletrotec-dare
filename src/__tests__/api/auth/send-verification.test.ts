import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  sendEmailVerification: vi.fn(),
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

import { POST } from "@/app/api/auth/send-verification/route";
import { sendEmailVerification } from "@/domain/auth/auth-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser } from "../../helpers/mock-data";

function postSendVerification(cookies?: Record<string, string>) {
  return createTestRequest("POST", "/api/auth/send-verification", { cookies });
}

describe("POST /api/auth/send-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 quando verificação enviada", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined);

      const res = await POST(postSendVerification({ et_session: "valid" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual({ ok: true });
      expect(sendEmailVerification).toHaveBeenCalledWith("user-id-1");
    });
  });

  describe("erro", () => {
    it("retorna 401 quando cookie de sessão ausente", async () => {
      const res = await POST(postSendVerification());

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe("UNAUTHORIZED");
    });

    it("retorna 401 quando sessão inválida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(null as never);

      const res = await POST(postSendVerification({ et_session: "bad" }));

      expect(res.status).toBe(401);
    });

    it("retorna 404 quando utilizador não encontrado", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(sendEmailVerification).mockRejectedValue(new Error("NOT_FOUND"));

      const res = await POST(postSendVerification({ et_session: "valid" }));

      expect(res.status).toBe(404);
      expect((await res.json()).error.code).toBe("NOT_FOUND");
    });

    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postSendVerification({ et_session: "valid" }));

      expect(res.status).toBe(403);
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postSendVerification({ et_session: "valid" }));

      expect(res.status).toBe(429);
    });

    it("retorna 500 quando erro inesperado", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(sendEmailVerification).mockRejectedValue(new Error("SMTP fail"));

      const res = await POST(postSendVerification({ et_session: "valid" }));

      expect(res.status).toBe(500);
      expect((await res.json()).error.code).toBe("SERVER_ERROR");
    });
  });
});
