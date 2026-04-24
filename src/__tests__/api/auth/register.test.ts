import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  registerUser: vi.fn(),
  mapUserToDTO: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  createSession: vi.fn(),
  getUserFromSessionToken: vi.fn(),
}));
vi.mock("@/lib/storage/secure-cookies", () => ({
  setSessionCookieOnResponse: vi.fn(),
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

import { POST } from "@/app/api/auth/register/route";
import { registerUser, mapUserToDTO } from "@/domain/auth/auth-service";
import { createSession } from "@/lib/auth/session";
import { setSessionCookieOnResponse } from "@/lib/storage/secure-cookies";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser, createMockUserDTO } from "../../helpers/mock-data";

const validPayload = {
  username: "newuser",
  email: "new@example.com",
  password: "StrongPass1!",
};

function postRegister(body?: unknown) {
  return createTestRequest("POST", "/api/auth/register", { body });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 201 com dados do utilizador", async () => {
      const user = createMockUser({ username: "newuser", email: "new@example.com" });
      const dto = createMockUserDTO({ username: "newuser", email: "new@example.com" });
      vi.mocked(registerUser).mockResolvedValue(user as never);
      vi.mocked(mapUserToDTO).mockReturnValue(dto as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "reg-tok", expiresAt: new Date() });

      const res = await POST(postRegister(validPayload));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toEqual({ success: true, data: dto });
    });

    it("define cookie de sessão", async () => {
      vi.mocked(registerUser).mockResolvedValue(createMockUser() as never);
      vi.mocked(mapUserToDTO).mockReturnValue(createMockUserDTO() as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "session-x", expiresAt: new Date() });

      await POST(postRegister(validPayload));

      expect(setSessionCookieOnResponse).toHaveBeenCalledWith(expect.anything(), "session-x");
    });
  });

  describe("erro", () => {
    it("retorna 400 INVALID_BODY quando corpo não é JSON", async () => {
      const req = createTestRequest("POST", "/api/auth/register");
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_BODY");
    });

    it("retorna 400 VALIDATION_ERROR quando username muito curto", async () => {
      const res = await POST(postRegister({ ...validPayload, username: "ab" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando email inválido", async () => {
      const res = await POST(postRegister({ ...validPayload, email: "not-email" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando password fraca", async () => {
      const res = await POST(postRegister({ ...validPayload, password: "weak" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 409 REGISTER_FAILED quando utilizador duplicado", async () => {
      vi.mocked(registerUser).mockRejectedValue(new Error("DUPLICATE"));

      const res = await POST(postRegister(validPayload));

      expect(res.status).toBe(409);
      expect((await res.json()).error.code).toBe("REGISTER_FAILED");
    });

    it("retorna 500 SERVER_ERROR quando configuração em falta", async () => {
      vi.mocked(registerUser).mockRejectedValue(new Error("CONFIG_ERROR"));

      const res = await POST(postRegister(validPayload));

      expect(res.status).toBe(500);
      expect((await res.json()).error.code).toBe("SERVER_ERROR");
    });

    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postRegister(validPayload));

      expect(res.status).toBe(403);
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postRegister(validPayload));

      expect(res.status).toBe(429);
    });

    it("retorna 500 quando erro inesperado ocorre", async () => {
      vi.mocked(registerUser).mockRejectedValue(new Error("unexpected"));

      const res = await POST(postRegister(validPayload));

      expect(res.status).toBe(500);
      expect((await res.json()).error.code).toBe("SERVER_ERROR");
    });
  });

  describe("lógica de negócio", () => {
    it("passa payload validado ao registerUser", async () => {
      vi.mocked(registerUser).mockResolvedValue(createMockUser() as never);
      vi.mocked(mapUserToDTO).mockReturnValue(createMockUserDTO() as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "t", expiresAt: new Date() });

      await POST(postRegister(validPayload));

      expect(registerUser).toHaveBeenCalledWith(validPayload);
    });

    it("username com caracteres especiais falha validação", async () => {
      const res = await POST(postRegister({ ...validPayload, username: "user@name" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });
  });
});
