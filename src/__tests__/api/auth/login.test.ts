import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
  loginUser: vi.fn(),
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

import { POST } from "@/app/api/auth/login/route";
import { loginUser, mapUserToDTO } from "@/domain/auth/auth-service";
import { createSession } from "@/lib/auth/session";
import { setSessionCookieOnResponse } from "@/lib/storage/secure-cookies";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limiter";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser, createMockUserDTO } from "../../helpers/mock-data";

function postLogin(body?: unknown) {
  return createTestRequest("POST", "/api/auth/login", { body });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
    vi.mocked(consumeRateLimit).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 com dados do utilizador", async () => {
      const user = createMockUser();
      const dto = createMockUserDTO();
      vi.mocked(loginUser).mockResolvedValue(user as never);
      vi.mocked(mapUserToDTO).mockReturnValue(dto as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "abc123", expiresAt: new Date() });

      const res = await POST(postLogin({ identifier: "testuser", password: "Pass1234!" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: dto });
    });

    it("define cookie de sessão na resposta", async () => {
      vi.mocked(loginUser).mockResolvedValue(createMockUser() as never);
      vi.mocked(mapUserToDTO).mockReturnValue(createMockUserDTO() as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "tok-xyz", expiresAt: new Date() });

      await POST(postLogin({ identifier: "testuser", password: "Pass1234!" }));

      expect(setSessionCookieOnResponse).toHaveBeenCalledWith(expect.anything(), "tok-xyz");
    });
  });

  describe("erro", () => {
    it("retorna 400 INVALID_BODY quando corpo não é JSON", async () => {
      const req = createTestRequest("POST", "/api/auth/login");
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("INVALID_BODY");
    });

    it("retorna 400 VALIDATION_ERROR quando identifier vazio", async () => {
      const res = await POST(postLogin({ identifier: "", password: "x" }));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 400 VALIDATION_ERROR quando password vazio", async () => {
      const res = await POST(postLogin({ identifier: "user", password: "" }));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("retorna 401 AUTH_FAILED quando credenciais inválidas", async () => {
      vi.mocked(loginUser).mockResolvedValue(null as never);

      const res = await POST(postLogin({ identifier: "user", password: "Wrong123!" }));

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("AUTH_FAILED");
    });

    it("retorna 403 FORBIDDEN quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const res = await POST(postLogin({ identifier: "user", password: "Pass1234!" }));

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("retorna 429 quando rate limit excedido", async () => {
      vi.mocked(consumeRateLimit).mockReturnValue(false);

      const res = await POST(postLogin({ identifier: "user", password: "Pass1234!" }));

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error.code).toBe("RATE_LIMIT");
    });

    it("retorna 500 quando erro interno ocorre", async () => {
      vi.mocked(loginUser).mockRejectedValue(new Error("DB down"));

      const res = await POST(postLogin({ identifier: "user", password: "Pass1234!" }));

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.code).toBe("SERVER_ERROR");
    });
  });

  describe("lógica de negócio", () => {
    it("passa dados validados ao loginUser", async () => {
      vi.mocked(loginUser).mockResolvedValue(null as never);

      await POST(postLogin({ identifier: "TestUser", password: "MyPass1!" }));

      expect(loginUser).toHaveBeenCalledWith({
        identifier: "TestUser",
        password: "MyPass1!",
      });
    });

    it("cria sessão com IP e user-agent corretos", async () => {
      vi.mocked(loginUser).mockResolvedValue(createMockUser() as never);
      vi.mocked(mapUserToDTO).mockReturnValue(createMockUserDTO() as never);
      vi.mocked(createSession).mockResolvedValue({ rawToken: "t", expiresAt: new Date() });

      const req = createTestRequest("POST", "/api/auth/login", {
        body: { identifier: "user", password: "Pass1234!" },
        headers: {
          "x-forwarded-for": "10.0.0.5",
          "user-agent": "TestAgent/2.0",
        },
      });
      await POST(req);

      expect(createSession).toHaveBeenCalledWith("user-id-1", "10.0.0.5", "TestAgent/2.0");
    });

    it("não cria sessão quando credenciais são inválidas", async () => {
      vi.mocked(loginUser).mockResolvedValue(null as never);

      await POST(postLogin({ identifier: "user", password: "Wrong!" }));

      expect(createSession).not.toHaveBeenCalled();
    });
  });
});
