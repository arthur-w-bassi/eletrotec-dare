import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  verifyEmailWithCode: vi.fn(),
  mapUserToDTO: vi.fn(),
  getUserById: vi.fn(),
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

import { POST } from "@/app/api/auth/verify-email/route";
import { verifyEmailWithCode, mapUserToDTO, getUserById } from "@/domain/auth/auth-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser, createMockUserDTO } from "../../helpers/mock-data";

function postVerify(body?: unknown, cookies?: Record<string, string>) {
  return createTestRequest("POST", "/api/auth/verify-email", { body, cookies });
}

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 com dados do utilizador quando código válido", async () => {
      const user = createMockUser({ emailVerifiedAt: new Date() });
      const dto = createMockUserDTO({ emailVerifiedAt: "2024-01-01T00:00:00.000Z" });
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("ok" as never);
      vi.mocked(getUserById).mockResolvedValue(user as never);
      vi.mocked(mapUserToDTO).mockReturnValue(dto as never);

      const res = await POST(postVerify({ code: "123456" }, { et_session: "valid" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.user).toEqual(dto);
    });
  });

  describe("erro", () => {
    it("retorna 400 INVALID_BODY quando corpo não é JSON", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);

      const req = createTestRequest("POST", "/api/auth/verify-email", {
        cookies: { et_session: "valid" },
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("retorna 400 VALIDATION_ERROR quando código não tem 6 dígitos", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);

      const res = await POST(postVerify({ code: "abc" }, { et_session: "valid" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando código tem letras", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);

      const res = await POST(postVerify({ code: "12ab56" }, { et_session: "valid" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VERIFY_FAILED quando código errado", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("invalid" as never);

      const res = await POST(postVerify({ code: "000000" }, { et_session: "valid" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VERIFY_FAILED");
    });

    it("retorna 400 VERIFY_LOCKED quando tentativas esgotadas", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("locked" as never);

      const res = await POST(postVerify({ code: "999999" }, { et_session: "valid" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VERIFY_LOCKED");
    });

    it("retorna 401 quando cookie de sessão ausente", async () => {
      const res = await POST(postVerify({ code: "123456" }));

      expect(res.status).toBe(401);
    });

    it("retorna 401 quando sessão inválida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(null as never);

      const res = await POST(postVerify({ code: "123456" }, { et_session: "bad" }));

      expect(res.status).toBe(401);
    });

    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postVerify({ code: "123456" }, { et_session: "valid" }));

      expect(res.status).toBe(403);
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postVerify({ code: "123456" }, { et_session: "valid" }));

      expect(res.status).toBe(429);
    });

    it("retorna 500 quando utilizador não encontrado após verificação", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("ok" as never);
      vi.mocked(getUserById).mockResolvedValue(null as never);

      const res = await POST(postVerify({ code: "123456" }, { et_session: "valid" }));

      expect(res.status).toBe(500);
      expect((await res.json()).error.code).toBe("SERVER_ERROR");
    });
  });

  describe("lógica de negócio", () => {
    it("chama verifyEmailWithCode com userId da sessão e payload", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("invalid" as never);

      await POST(postVerify({ code: "654321" }, { et_session: "valid" }));

      expect(verifyEmailWithCode).toHaveBeenCalledWith("user-id-1", { code: "654321" });
    });

    it("busca dados fresh do utilizador após verificação bem sucedida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(verifyEmailWithCode).mockResolvedValue("ok" as never);
      vi.mocked(getUserById).mockResolvedValue(createMockUser() as never);
      vi.mocked(mapUserToDTO).mockReturnValue(createMockUserDTO() as never);

      await POST(postVerify({ code: "123456" }, { et_session: "valid" }));

      expect(getUserById).toHaveBeenCalledWith("user-id-1");
      expect(mapUserToDTO).toHaveBeenCalled();
    });
  });
});
