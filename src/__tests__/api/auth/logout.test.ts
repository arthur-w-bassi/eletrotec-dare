import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  createSession: vi.fn(),
  getUserFromSessionToken: vi.fn(),
  deleteSessionByRawToken: vi.fn(),
  deleteAllSessionsForUser: vi.fn(),
}));
vi.mock("@/lib/storage/secure-cookies", () => ({
  clearSessionCookieOnResponse: vi.fn(),
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

import { POST } from "@/app/api/auth/logout/route";
import { deleteSessionByRawToken } from "@/lib/auth/session";
import { clearSessionCookieOnResponse } from "@/lib/storage/secure-cookies";
import { isMutationOriginAllowed } from "@/lib/security/csrf";
import { logService } from "@/lib/logger/log-service";
import { createTestRequest } from "../../helpers/request-factory";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMutationOriginAllowed).mockReturnValue(true);
  });

  describe("sucesso", () => {
    it("retorna 200 e limpa cookie quando sessão existe", async () => {
      vi.mocked(deleteSessionByRawToken).mockResolvedValue(undefined);

      const req = createTestRequest("POST", "/api/auth/logout", {
        cookies: { et_session: "valid-token" },
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: { ok: true } });
      expect(deleteSessionByRawToken).toHaveBeenCalledWith("valid-token");
      expect(clearSessionCookieOnResponse).toHaveBeenCalled();
    });

    it("retorna 200 e limpa cookie mesmo sem sessão", async () => {
      const req = createTestRequest("POST", "/api/auth/logout");
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(deleteSessionByRawToken).not.toHaveBeenCalled();
      expect(clearSessionCookieOnResponse).toHaveBeenCalled();
    });
  });

  describe("erro", () => {
    it("retorna 403 quando CSRF falha", async () => {
      vi.mocked(isMutationOriginAllowed).mockReturnValue(false);

      const req = createTestRequest("POST", "/api/auth/logout");
      const res = await POST(req);

      expect(res.status).toBe(403);
    });

    it("loga erro mas continua quando deleção de sessão falha", async () => {
      vi.mocked(deleteSessionByRawToken).mockRejectedValue(new Error("DB error"));

      const req = createTestRequest("POST", "/api/auth/logout", {
        cookies: { et_session: "tok" },
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(logService.error).toHaveBeenCalledWith(
        "logout falhou",
        expect.objectContaining({ err: expect.any(String) }),
      );
      expect(clearSessionCookieOnResponse).toHaveBeenCalled();
    });
  });
});
