import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/proposal/proposal-template-service", () => ({
  listProposalTemplates: vi.fn(),
  mapProposalTemplateToDTO: vi.fn(),
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

import { ServiceCategory } from "@/generated/prisma/client";

import { GET } from "@/app/api/proposal-templates/route";
import {
  listProposalTemplates,
  mapProposalTemplateToDTO,
} from "@/domain/proposal/proposal-template-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser } from "../../helpers/mock-data";
import { TEMPLATE_ID } from "../../helpers/proposal-mock-data";

const SESSION = { et_session: "valid-token" };

function getTemplates(path = "/api/proposal-templates", cookies?: Record<string, string>) {
  return createTestRequest("GET", path, { cookies });
}

const seedTemplateRow = {
  id: TEMPLATE_ID,
  title: "Instalação Residencial Completa",
  description: "Pacote completo para residências",
  category: ServiceCategory.ELECTRICAL,
  introduction: "Proposta para instalação elétrica residencial.",
  serviceIds: ["33333333-3333-4333-8333-333333333333"],
  schedule: [{ period: "Semana 1", activity: "Levantamento", notes: "" }],
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const seedTemplateDto = {
  id: TEMPLATE_ID,
  title: "Instalação Residencial Completa",
  description: "Pacote completo para residências",
  category: "Electrical" as const,
  introduction: "Proposta para instalação elétrica residencial.",
  serviceIds: ["33333333-3333-4333-8333-333333333333"],
  schedule: [{ period: "Semana 1", activity: "Levantamento", notes: "" }],
};

describe("GET /api/proposal-templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("autenticação", () => {
    it("retorna 401 sem sessão", async () => {
      const res = await GET(getTemplates());

      expect(res.status).toBe(401);
      expect(listProposalTemplates).not.toHaveBeenCalled();
    });
  });

  describe("listagem", () => {
    beforeEach(() => {
      vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
    });

    it("retorna templates do seed com paginação", async () => {
      vi.mocked(listProposalTemplates).mockResolvedValue({
        items: [seedTemplateRow],
        total: 5,
        page: 1,
        pageSize: 20,
      });
      vi.mocked(mapProposalTemplateToDTO).mockReturnValue(seedTemplateDto);

      const res = await GET(getTemplates("/api/proposal-templates", SESSION));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.items).toEqual([seedTemplateDto]);
      expect(body.data.total).toBe(5);
    });

    it("repassa filtro de categoria", async () => {
      vi.mocked(listProposalTemplates).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      await GET(getTemplates("/api/proposal-templates?category=Electrical", SESSION));

      expect(listProposalTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ category: "Electrical" }),
      );
    });

    it("repassa busca por texto", async () => {
      vi.mocked(listProposalTemplates).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      await GET(getTemplates("/api/proposal-templates?search=residencial", SESSION));

      expect(listProposalTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ search: "residencial" }),
      );
    });

    it("retorna 400 para categoria inválida", async () => {
      const res = await GET(
        getTemplates("/api/proposal-templates?category=Invalid", SESSION),
      );

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
    });
  });
});
