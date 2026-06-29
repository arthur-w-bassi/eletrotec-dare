import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  proposal: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  proposalLineItem: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  proposalInternalCost: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  proposalTemplate: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
  },
  customer: {
    findUnique: vi.fn(),
  },
  catalogItem: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: mockPrisma,
}));

import { ProposalStatus } from "@/generated/prisma/client";

import {
  completeProposal,
  mapProposalToDTO,
  updateProposal,
} from "@/domain/proposal/proposal-service";
import {
  CATALOG_ITEM_ID,
  createFullBuilderPayload,
  createMockProposalRow,
  CUSTOMER_ID,
  PROPOSAL_ID,
} from "../../helpers/proposal-mock-data";

function resetPrismaMocks(): void {
  vi.clearAllMocks();
  mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockPrisma) => unknown) =>
    callback(mockPrisma),
  );
}

describe("proposal-service complete", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.customer.findUnique.mockResolvedValue({ id: CUSTOMER_ID });
    mockPrisma.catalogItem.findMany.mockResolvedValue([{ id: CATALOG_ITEM_ID }]);
  });

  describe("completeProposal", () => {
    it("transiciona DRAFT para COMPLETED", async () => {
      const draft = createMockProposalRow({ status: ProposalStatus.DRAFT });
      const completed = createMockProposalRow({
        status: ProposalStatus.COMPLETED,
        completedAt: new Date("2026-06-29T15:00:00.000Z"),
      });

      mockPrisma.proposal.findUnique
        .mockResolvedValueOnce(draft)
        .mockResolvedValueOnce(completed);
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(completed);

      const result = await completeProposal(PROPOSAL_ID);

      expect(mockPrisma.proposal.update).toHaveBeenCalledWith({
        where: { id: PROPOSAL_ID },
        data: {
          status: ProposalStatus.COMPLETED,
          completedAt: expect.any(Date),
        },
      });
      expect(mapProposalToDTO(result).status).toBe("completed");
    });

    it("é idempotente quando proposta já está COMPLETED", async () => {
      const completed = createMockProposalRow({
        status: ProposalStatus.COMPLETED,
        completedAt: new Date("2026-06-29T15:00:00.000Z"),
      });

      mockPrisma.proposal.findUnique.mockResolvedValue(completed);
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(completed);

      const result = await completeProposal(PROPOSAL_ID);

      expect(mockPrisma.proposal.update).not.toHaveBeenCalled();
      expect(mapProposalToDTO(result).status).toBe("completed");
    });

    it("retorna 404 quando proposta não existe", async () => {
      mockPrisma.proposal.findUnique.mockResolvedValue(null);

      await expect(completeProposal(PROPOSAL_ID)).rejects.toMatchObject({
        status: 404,
        code: "NOT_FOUND",
      });
    });
  });

  describe("PUT em proposta COMPLETED", () => {
    it("permite atualizar documento após conclusão", async () => {
      const completed = createMockProposalRow({ status: ProposalStatus.COMPLETED });
      const updated = createMockProposalRow({
        status: ProposalStatus.COMPLETED,
        notes: "Notas revisadas",
      });

      mockPrisma.proposal.findUnique.mockResolvedValue(completed);
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(updated);

      const result = await updateProposal(
        PROPOSAL_ID,
        createFullBuilderPayload({ notes: "Notas revisadas" }),
      );

      expect(mockPrisma.proposal.update).toHaveBeenCalled();
      expect(mapProposalToDTO(result).notes).toBe("Notas revisadas");
      expect(mapProposalToDTO(result).status).toBe("completed");
    });
  });
});
