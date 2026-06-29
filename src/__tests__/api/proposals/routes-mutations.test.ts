import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/domain/proposal/proposal-service", () => ({
  createProposal: vi.fn(),
  updateProposal: vi.fn(),
  completeProposal: vi.fn(),
  mapProposalToDTO: vi.fn(),
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

import { POST } from "@/app/api/proposals/route";
import { PUT } from "@/app/api/proposals/[id]/route";
import { POST as POSTComplete } from "@/app/api/proposals/[id]/complete/route";
import {
  completeProposal,
  createProposal,
  mapProposalToDTO,
  updateProposal,
} from "@/domain/proposal/proposal-service";
import { getUserFromSessionToken } from "@/lib/auth/session";
import { createTestRequest } from "../../helpers/request-factory";
import { createMockUser } from "../../helpers/mock-data";
import {
  createFullBuilderPayload,
  createMockProposalDocument,
  createMockProposalRow,
  PROPOSAL_ID,
} from "../../helpers/proposal-mock-data";

const SESSION = { et_session: "valid-token" };

function routeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("rotas de mutação /api/proposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromSessionToken).mockResolvedValue(createMockUser() as never);
  });

  describe("POST /api/proposals", () => {
    it("cria proposta com payload completo do builder", async () => {
      const payload = createFullBuilderPayload();
      const row = createMockProposalRow();
      const dto = createMockProposalDocument();
      vi.mocked(createProposal).mockResolvedValue(row);
      vi.mocked(mapProposalToDTO).mockReturnValue(dto);

      const req = createTestRequest("POST", "/api/proposals", {
        body: payload,
        cookies: SESSION,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(dto);
      expect(createProposal).toHaveBeenCalledWith(payload, "user-id-1");
    });

    it("retorna 400 VALIDATION_ERROR para payload inválido", async () => {
      const req = createTestRequest("POST", "/api/proposals", {
        body: { cover: { title: "" } },
        cookies: SESSION,
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
      expect(createProposal).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/proposals/:id", () => {
    it("atualiza proposta existente", async () => {
      const payload = createFullBuilderPayload();
      const row = createMockProposalRow();
      const dto = createMockProposalDocument();
      vi.mocked(updateProposal).mockResolvedValue(row);
      vi.mocked(mapProposalToDTO).mockReturnValue(dto);

      const req = createTestRequest("PUT", `/api/proposals/${PROPOSAL_ID}`, {
        body: payload,
        cookies: SESSION,
      });
      const res = await PUT(req, routeParams(PROPOSAL_ID));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual(dto);
      expect(updateProposal).toHaveBeenCalledWith(PROPOSAL_ID, payload);
    });

    it("retorna 400 para id inválido", async () => {
      const req = createTestRequest("PUT", "/api/proposals/not-a-uuid", {
        body: createFullBuilderPayload(),
        cookies: SESSION,
      });
      const res = await PUT(req, routeParams("not-a-uuid"));

      expect(res.status).toBe(400);
      expect(updateProposal).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/proposals/:id/complete", () => {
    it("marca proposta como concluída", async () => {
      const row = createMockProposalRow();
      const dto = createMockProposalDocument({ status: "completed" });
      vi.mocked(completeProposal).mockResolvedValue(row);
      vi.mocked(mapProposalToDTO).mockReturnValue(dto);

      const req = createTestRequest("POST", `/api/proposals/${PROPOSAL_ID}/complete`, {
        body: {},
        cookies: SESSION,
      });
      const res = await POSTComplete(req, routeParams(PROPOSAL_ID));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.status).toBe("completed");
      expect(completeProposal).toHaveBeenCalledWith(PROPOSAL_ID);
    });
  });
});
