import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { normalizeProposal } from "@/domain/proposal/proposal-normalize";
import type { ProposalDocument } from "@/domain/proposal/proposal-types";
import {
  BLOCK_SCHEDULE_ID,
  BLOCK_TEXT_ID,
  LINE_ITEM_ID,
  SCHEDULE_ITEM_ID,
  TINY_BASE64_IMAGE,
} from "../../helpers/proposal-mock-data";

describe("normalizeProposal", () => {
  const baseDocument: ProposalDocument = {
    status: "draft",
    cover: {
      title: "Proposta",
      client: "Cliente",
      number: "PR-2026-001",
      date: "Junho de 2026",
    },
    introduction: "Intro",
    lineItems: [],
    blocks: [],
    schedule: [],
    notes: "",
    signature: { preparedBy: "Empresa", date: "29 de Junho de 2026" },
    financial: { discountPercent: 0, taxPercent: 0 },
    internalCosts: [],
  };

  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(BLOCK_SCHEDULE_ID);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("migra campo image legado para images[]", () => {
    const legacy = {
      ...baseDocument,
      lineItems: [
        {
          id: LINE_ITEM_ID,
          serviceId: "",
          title: "Serviço",
          description: "",
          image: TINY_BASE64_IMAGE,
          qty: 1,
          unitPrice: 100,
        } as ProposalDocument["lineItems"][number] & { image: string },
      ],
    };

    const normalized = normalizeProposal(legacy);

    expect(normalized.lineItems[0]!.images).toEqual([TINY_BASE64_IMAGE]);
  });

  it("migra schedule legado para bloco schedule quando ausente", () => {
    const legacy: ProposalDocument = {
      ...baseDocument,
      schedule: [
        {
          id: SCHEDULE_ITEM_ID,
          period: "Semana 1",
          activity: "Instalação",
          notes: "",
        },
      ],
      blocks: [{ id: BLOCK_TEXT_ID, type: "text", content: "Texto" }],
    };

    const normalized = normalizeProposal(legacy);

    expect(normalized.schedule).toEqual([]);
    const scheduleBlock = normalized.blocks.find((b) => b.type === "schedule");
    expect(scheduleBlock).toBeDefined();
    expect(scheduleBlock?.type).toBe("schedule");
    if (scheduleBlock?.type === "schedule") {
      expect(scheduleBlock.items).toHaveLength(1);
      expect(scheduleBlock.items[0]!.activity).toBe("Instalação");
    }
  });

  it("não duplica bloco schedule quando já existe", () => {
    const withBlock: ProposalDocument = {
      ...baseDocument,
      schedule: [
        {
          id: SCHEDULE_ITEM_ID,
          period: "Semana 1",
          activity: "Legado",
          notes: "",
        },
      ],
      blocks: [
        {
          id: BLOCK_SCHEDULE_ID,
          type: "schedule",
          items: [
            {
              id: SCHEDULE_ITEM_ID,
              period: "Semana 1",
              activity: "Do bloco",
              notes: "",
            },
          ],
        },
      ],
    };

    const normalized = normalizeProposal(withBlock);

    expect(normalized.blocks.filter((b) => b.type === "schedule")).toHaveLength(1);
  });

  it("normaliza sectionOrder com chaves válidas e preenche ausentes", () => {
    const doc: ProposalDocument = {
      ...baseDocument,
      blocks: [
        { id: BLOCK_TEXT_ID, type: "text", content: "A" },
        { id: BLOCK_SCHEDULE_ID, type: "divider" },
      ],
      sectionOrder: ["services", "introduction"],
    };

    const normalized = normalizeProposal(doc);

    expect(normalized.sectionOrder).toEqual([
      "services",
      "introduction",
      `block:${BLOCK_TEXT_ID}`,
      `block:${BLOCK_SCHEDULE_ID}`,
    ]);
  });

  it("preenche defaults de capa e campos opcionais", () => {
    const sparse = {
      status: "draft" as const,
      cover: {
        title: "T",
        client: "C",
        number: "N",
        date: "D",
      },
      lineItems: [],
      blocks: [],
      schedule: [],
      signature: { preparedBy: "E", date: "D" },
    } as ProposalDocument;

    const normalized = normalizeProposal(sparse);

    expect(normalized.cover.clientAddress).toBe("");
    expect(normalized.cover.clientDocument).toBe("");
    expect(normalized.cover.clientContact).toBe("");
    expect(normalized.notes).toBe("");
    expect(normalized.introduction).toBe("");
    expect(normalized.internalCosts).toEqual([]);
    expect(normalized.financial).toEqual({ discountPercent: 0, taxPercent: 0 });
  });

  it("é idempotente em round-trip", () => {
    const doc: ProposalDocument = {
      ...baseDocument,
      lineItems: [
        {
          id: LINE_ITEM_ID,
          serviceId: "",
          title: "Serviço",
          description: "Desc",
          images: [TINY_BASE64_IMAGE],
          qty: 2,
          unitPrice: 500,
        },
      ],
      blocks: [{ id: BLOCK_TEXT_ID, type: "text", content: "Conteúdo" }],
      sectionOrder: ["introduction", "services", `block:${BLOCK_TEXT_ID}`],
    };

    const once = normalizeProposal(doc);
    const twice = normalizeProposal(once);

    expect(twice).toEqual(once);
  });
});
