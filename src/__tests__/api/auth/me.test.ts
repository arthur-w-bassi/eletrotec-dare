import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/auth/auth-service", () => ({
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

import { GET } from "@/app/api/auth/me/route";
import { mapUserToDTO, getUserById } from "@/domain/auth/auth-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser, createMockUserDTO } from "../../helpers/mock-data";

function getMe(cookies?: Record<string, string>) {
  return createTestRequest("GET", "/api/auth/me", { cookies });
}

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("retorna 200 com dados atualizados do utilizador", async () => {
      const user = createMockUser();
      const freshUser = createMockUser({ updatedAt: new Date("2024-06-01") });
      const dto = createMockUserDTO();
      vi.mocked(getUserFromSessionToken).mockResolvedValue(user as never);
      vi.mocked(getUserById).mockResolvedValue(freshUser as never);
      vi.mocked(mapUserToDTO).mockReturnValue(dto as never);

      const res = await GET(getMe({ et_session: "valid" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: dto });
      expect(getUserById).toHaveBeenCalledWith("user-id-1");
    });
  });

  describe("erro", () => {
    it("retorna 401 quando cookie de sessão ausente", async () => {
      const res = await GET(getMe());

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe("UNAUTHORIZED");
    });

    it("retorna 401 quando sessão inválida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(null as never);

      const res = await GET(getMe({ et_session: "expired" }));

      expect(res.status).toBe(401);
      expect((await res.json()).error.message).toBe("Sessão inválida ou expirada.");
    });

    it("retorna 401 quando utilizador não encontrado após validação de sessão", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
      vi.mocked(getUserById).mockResolvedValue(null as never);

      const res = await GET(getMe({ et_session: "valid" }));

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("lógica de negócio", () => {
    it("busca dados fresh do utilizador (não usa cache da sessão)", async () => {
      const sessionUser = createMockUser({ username: "old_name" });
      const freshUser = createMockUser({ username: "new_name" });
      const dto = createMockUserDTO({ username: "new_name" });
      vi.mocked(getUserFromSessionToken).mockResolvedValue(sessionUser as never);
      vi.mocked(getUserById).mockResolvedValue(freshUser as never);
      vi.mocked(mapUserToDTO).mockReturnValue(dto as never);

      const res = await GET(getMe({ et_session: "valid" }));
      const body = await res.json();

      expect(mapUserToDTO).toHaveBeenCalledWith(freshUser);
      expect(body.data.username).toBe("new_name");
    });
  });
});
