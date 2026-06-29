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
  createProposal,
  mapProposalToDTO,
  updateProposal,
} from "@/domain/proposal/proposal-service";
import {
  CATALOG_ITEM_ID,
  createFullBuilderPayload,
  createMockProposalRow,
  CUSTOMER_ID,
  LINE_ITEM_ID,
  PROPOSAL_ID,
  TINY_BASE64_IMAGE,
} from "../../helpers/proposal-mock-data";

function resetPrismaMocks(): void {
  vi.clearAllMocks();
  mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockPrisma) => unknown) =>
    callback(mockPrisma),
  );
}

describe("proposal-service create/update", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.customer.findUnique.mockResolvedValue({ id: CUSTOMER_ID });
    mockPrisma.catalogItem.findMany.mockResolvedValue([{ id: CATALOG_ITEM_ID }]);
  });

  describe("createProposal", () => {
    it("persiste payload completo do builder com todos os tipos de bloco", async () => {
      const payload = createFullBuilderPayload();
      const row = createMockProposalRow();

      mockPrisma.proposal.create.mockResolvedValue({ id: PROPOSAL_ID });
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(row);

      const result = await createProposal(payload, "user-id-1");

      expect(mockPrisma.proposal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coverTitle: payload.cover.title,
            coverClient: payload.cover.client,
            customerId: CUSTOMER_ID,
            createdById: "user-id-1",
            status: ProposalStatus.DRAFT,
          }),
        }),
      );

      expect(mockPrisma.proposalLineItem.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: LINE_ITEM_ID,
            catalogItemId: CATALOG_ITEM_ID,
            title: payload.lineItems[0]!.title,
            images: [TINY_BASE64_IMAGE],
            sortOrder: 0,
          }),
        ]),
      });

      expect(mockPrisma.proposalInternalCost.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            description: "Material interno",
            amount: expect.anything(),
          }),
        ]),
      });

      const createData = mockPrisma.proposal.create.mock.calls[0]![0] as {
        data: { blocks: unknown };
      };
      const blocks = createData.data.blocks as { type: string }[];
      expect(blocks.map((b) => b.type)).toEqual([
        "text",
        "heading",
        "divider",
        "image",
        "schedule",
      ]);

      const dto = mapProposalToDTO(result);
      expect(dto.cover.title).toBe(payload.cover.title);
      expect(dto.lineItems[0]!.images).toEqual([TINY_BASE64_IMAGE]);
      expect(dto.blocks).toHaveLength(5);
      expect(dto.internalCosts).toHaveLength(1);
    });

    it("rejeita quando cliente não existe", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(createProposal(createFullBuilderPayload(), "user-id-1")).rejects.toMatchObject({
        status: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    });

    it("rejeita quando serviço do catálogo não existe", async () => {
      mockPrisma.catalogItem.findMany.mockResolvedValue([]);

      await expect(createProposal(createFullBuilderPayload(), "user-id-1")).rejects.toMatchObject({
        status: 404,
        code: "CATALOG_ITEM_NOT_FOUND",
      });
    });
  });

  describe("updateProposal", () => {
    it("atualiza proposta existente com payload completo", async () => {
      const payload = createFullBuilderPayload({
        cover: {
          ...createFullBuilderPayload().cover,
          title: "Proposta Atualizada",
        },
      });
      const existing = createMockProposalRow();
      const updated = createMockProposalRow({
        coverTitle: "Proposta Atualizada",
      });

      mockPrisma.proposal.findUnique.mockResolvedValue(existing);
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(updated);

      const result = await updateProposal(PROPOSAL_ID, payload);

      expect(mockPrisma.proposalLineItem.deleteMany).toHaveBeenCalledWith({
        where: { proposalId: PROPOSAL_ID },
      });
      expect(mockPrisma.proposalInternalCost.deleteMany).toHaveBeenCalledWith({
        where: { proposalId: PROPOSAL_ID },
      });
      expect(mockPrisma.proposal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: PROPOSAL_ID },
          data: expect.objectContaining({
            coverTitle: "Proposta Atualizada",
          }),
        }),
      );
      expect(mapProposalToDTO(result).cover.title).toBe("Proposta Atualizada");
    });

    it("permite PUT em proposta COMPLETED", async () => {
      const completed = createMockProposalRow({ status: ProposalStatus.COMPLETED });
      const updated = createMockProposalRow({
        status: ProposalStatus.COMPLETED,
        coverTitle: "Edição pós-conclusão",
      });

      mockPrisma.proposal.findUnique.mockResolvedValue(completed);
      mockPrisma.proposal.findUniqueOrThrow.mockResolvedValue(updated);

      const result = await updateProposal(
        PROPOSAL_ID,
        createFullBuilderPayload({
          cover: {
            ...createFullBuilderPayload().cover,
            title: "Edição pós-conclusão",
          },
        }),
      );

      expect(mockPrisma.proposal.update).toHaveBeenCalled();
      expect(mapProposalToDTO(result).cover.title).toBe("Edição pós-conclusão");
    });

    it("retorna 404 quando proposta não existe", async () => {
      mockPrisma.proposal.findUnique.mockResolvedValue(null);

      await expect(
        updateProposal(PROPOSAL_ID, createFullBuilderPayload()),
      ).rejects.toMatchObject({
        status: 404,
        code: "NOT_FOUND",
      });
    });
  });
});
