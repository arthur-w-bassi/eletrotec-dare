import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/proposal/proposal-service", () => ({
  listProposals: vi.fn(),
  mapProposalToListDTO: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
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

import { GET } from "@/app/api/proposals/route";
import { listProposals, mapProposalToListDTO } from "@/domain/proposal/proposal-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser } from "../../helpers/mock-data";
import {
  createMockProposalListItem,
  createMockProposalRow,
  PROPOSAL_ID,
} from "../../helpers/proposal-mock-data";

const SESSION = { et_session: "valid-token" };

function getProposals(path = "/api/proposals", cookies?: Record<string, string>) {
  return createTestRequest("GET", path, { cookies });
}

describe("GET /api/proposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("autenticação", () => {
    it("retorna 401 quando sessão ausente", async () => {
      const res = await GET(getProposals());

      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe("UNAUTHORIZED");
      expect(listProposals).not.toHaveBeenCalled();
    });

    it("retorna 401 quando sessão inválida", async () => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(null);

      const res = await GET(getProposals("/api/proposals", SESSION));

      expect(res.status).toBe(401);
      expect(listProposals).not.toHaveBeenCalled();
    });
  });

  describe("listagem", () => {
    beforeEach(() => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
    });

    it("retorna 200 com itens paginados", async () => {
      const row = createMockProposalRow();
      const listItem = createMockProposalListItem();
      vi.mocked(listProposals).mockResolvedValue({
        items: [row],
        total: 1,
        page: 1,
        pageSize: 20,
      });
      vi.mocked(mapProposalToListDTO).mockReturnValue(listItem);

      const res = await GET(getProposals("/api/proposals", SESSION));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.items).toEqual([listItem]);
      expect(body.data.total).toBe(1);
      expect(body.data.page).toBe(1);
      expect(body.data.pageSize).toBe(20);
    });

    it("repassa paginação para listProposals", async () => {
      vi.mocked(listProposals).mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        pageSize: 10,
      });

      await GET(getProposals("/api/proposals?page=2&pageSize=10", SESSION));

      expect(listProposals).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
        page: 2,
        pageSize: 10,
      });
    });

    it("repassa filtro de status draft", async () => {
      vi.mocked(listProposals).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      await GET(getProposals("/api/proposals?status=draft", SESSION));

      expect(listProposals).toHaveBeenCalledWith(
        expect.objectContaining({ status: "draft" }),
      );
    });

    it("repassa filtro de status completed", async () => {
      vi.mocked(listProposals).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      await GET(getProposals("/api/proposals?status=completed", SESSION));

      expect(listProposals).toHaveBeenCalledWith(
        expect.objectContaining({ status: "completed" }),
      );
    });

    it("repassa busca por texto", async () => {
      vi.mocked(listProposals).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      await GET(getProposals("/api/proposals?search=Cliente%20Teste", SESSION));

      expect(listProposals).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Cliente Teste" }),
      );
    });

    it("retorna 400 VALIDATION_ERROR para status inválido", async () => {
      const res = await GET(getProposals("/api/proposals?status=archived", SESSION));

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
      expect(listProposals).not.toHaveBeenCalled();
    });

    it("mapeia cada item com mapProposalToListDTO", async () => {
      const row = createMockProposalRow({ id: PROPOSAL_ID });
      vi.mocked(listProposals).mockResolvedValue({
        items: [row],
        total: 1,
        page: 1,
        pageSize: 20,
      });
      vi.mocked(mapProposalToListDTO).mockReturnValue(createMockProposalListItem());

      await GET(getProposals("/api/proposals", SESSION));

      expect(mapProposalToListDTO).toHaveBeenCalledWith(row, 0, [row]);
    });
  });
});
