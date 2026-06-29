import { Prisma, ProposalStatus } from "@/generated/prisma/client";

import type { CreateProposalPayload } from "@/domain/proposal/proposal-schemas";
import type { ProposalDocument, ProposalListItemDTO } from "@/domain/proposal/proposal-types";
import type { ProposalWithDetails } from "@/domain/proposal/proposal-service";

export const PROPOSAL_ID = "11111111-1111-4111-8111-111111111111";
export const CUSTOMER_ID = "22222222-2222-4222-8222-222222222222";
export const CATALOG_ITEM_ID = "33333333-3333-4333-8333-333333333333";
export const LINE_ITEM_ID = "44444444-4444-4444-8444-444444444444";
export const INTERNAL_COST_ID = "55555555-5555-4555-8555-555555555555";
export const BLOCK_TEXT_ID = "66666666-6666-4666-8666-666666666666";
export const BLOCK_HEADING_ID = "77777777-7777-4777-8777-777777777777";
export const BLOCK_DIVIDER_ID = "88888888-8888-4888-8888-888888888888";
export const BLOCK_IMAGE_ID = "99999999-9999-4999-8999-999999999999";
export const BLOCK_SCHEDULE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const SCHEDULE_ITEM_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const TEMPLATE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

export const TINY_BASE64_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function createFullBuilderPayload(
  overrides?: Partial<CreateProposalPayload>,
): CreateProposalPayload {
  return {
    cover: {
      title: "Instalação Elétrica Residencial",
      client: "Cliente Teste Ltda",
      clientAddress: "Rua das Flores, 100",
      clientDocument: "12.345.678/0001-90",
      clientContact: "contato@cliente.com",
      customerId: CUSTOMER_ID,
    },
    introduction: "Apresentamos nossa proposta comercial.",
    notes: "Validade de 30 dias.",
    signature: {
      preparedBy: "Eletro Tec Dare",
      date: "29 de Junho de 2026",
    },
    financial: {
      discountPercent: 10,
      taxPercent: 5,
    },
    lineItems: [
      {
        id: LINE_ITEM_ID,
        serviceId: CATALOG_ITEM_ID,
        title: "Instalação de quadro elétrico",
        description: "Quadro principal com disjuntores",
        images: [TINY_BASE64_IMAGE],
        qty: 2,
        unitPrice: 1500,
      },
    ],
    internalCosts: [
      {
        id: INTERNAL_COST_ID,
        description: "Material interno",
        amount: 350,
      },
    ],
    blocks: [
      { id: BLOCK_TEXT_ID, type: "text", content: "Texto do bloco" },
      { id: BLOCK_HEADING_ID, type: "heading", content: "Título da seção" },
      { id: BLOCK_DIVIDER_ID, type: "divider" },
      { id: BLOCK_IMAGE_ID, type: "image", alt: "Imagem ilustrativa" },
      {
        id: BLOCK_SCHEDULE_ID,
        type: "schedule",
        items: [
          {
            id: SCHEDULE_ITEM_ID,
            period: "Semana 1",
            activity: "Levantamento",
            notes: "Visita técnica",
          },
        ],
      },
    ],
    sectionOrder: [
      "introduction",
      "services",
      `block:${BLOCK_TEXT_ID}`,
      `block:${BLOCK_HEADING_ID}`,
      `block:${BLOCK_DIVIDER_ID}`,
      `block:${BLOCK_IMAGE_ID}`,
      `block:${BLOCK_SCHEDULE_ID}`,
    ],
    ...overrides,
  };
}

export function createMockProposalRow(
  overrides?: Partial<ProposalWithDetails>,
): ProposalWithDetails {
  const createdAt = new Date("2026-06-29T10:00:00.000Z");
  const updatedAt = new Date("2026-06-29T12:00:00.000Z");

  return {
    id: PROPOSAL_ID,
    proposalNumber: 42,
    status: ProposalStatus.DRAFT,
    customerId: CUSTOMER_ID,
    createdById: "user-id-1",
    coverTitle: "Instalação Elétrica Residencial",
    coverClient: "Cliente Teste Ltda",
    coverClientAddress: "Rua das Flores, 100",
    coverClientDocument: "12.345.678/0001-90",
    coverClientContact: "contato@cliente.com",
    coverDate: "Junho de 2026",
    introduction: "Apresentamos nossa proposta comercial.",
    notes: "Validade de 30 dias.",
    signaturePreparedBy: "Eletro Tec Dare",
    signatureDate: "29 de Junho de 2026",
    discountPercent: new Prisma.Decimal("10"),
    taxPercent: new Prisma.Decimal("5"),
    blocks: createFullBuilderPayload().blocks as unknown as Prisma.JsonValue,
    sectionOrder: createFullBuilderPayload().sectionOrder as unknown as Prisma.JsonValue,
    schedule: [] as unknown as Prisma.JsonValue,
    completedAt: null,
    createdAt,
    updatedAt,
    customer: {
      id: CUSTOMER_ID,
      name: "Cliente Teste Ltda",
      document: "12.345.678/0001-90",
      email: "contato@cliente.com",
      phone: null,
      address: "Rua das Flores, 100",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
      notes: null,
      isActive: true,
      createdAt,
      updatedAt,
    },
    lineItems: [
      {
        id: LINE_ITEM_ID,
        proposalId: PROPOSAL_ID,
        catalogItemId: CATALOG_ITEM_ID,
        title: "Instalação de quadro elétrico",
        description: "Quadro principal com disjuntores",
        images: [TINY_BASE64_IMAGE] as unknown as Prisma.JsonValue,
        quantity: new Prisma.Decimal("2"),
        unitPrice: new Prisma.Decimal("1500"),
        itemTotal: new Prisma.Decimal("3000"),
        sortOrder: 0,
      },
    ],
    internalCosts: [
      {
        id: INTERNAL_COST_ID,
        proposalId: PROPOSAL_ID,
        description: "Material interno",
        amount: new Prisma.Decimal("350"),
        sortOrder: 0,
      },
    ],
    ...overrides,
  };
}

export function createMockProposalListItem(
  overrides?: Partial<ProposalListItemDTO>,
): ProposalListItemDTO {
  return {
    id: PROPOSAL_ID,
    number: "PR-2026-042",
    title: "Instalação Elétrica Residencial",
    client: "Cliente Teste Ltda",
    status: "draft",
    serviceCount: 1,
    grandTotal: 2835,
    createdAt: "2026-06-29T10:00:00.000Z",
    updatedAt: "2026-06-29T12:00:00.000Z",
    ...overrides,
  };
}

export function createMockProposalDocument(
  overrides?: Partial<ProposalDocument>,
): ProposalDocument {
  return {
    id: PROPOSAL_ID,
    status: "draft",
    cover: {
      title: "Instalação Elétrica Residencial",
      client: "Cliente Teste Ltda",
      clientAddress: "Rua das Flores, 100",
      clientDocument: "12.345.678/0001-90",
      clientContact: "contato@cliente.com",
      customerId: CUSTOMER_ID,
      number: "PR-2026-042",
      date: "Junho de 2026",
    },
    introduction: "Apresentamos nossa proposta comercial.",
    lineItems: [
      {
        id: LINE_ITEM_ID,
        serviceId: CATALOG_ITEM_ID,
        title: "Instalação de quadro elétrico",
        description: "Quadro principal com disjuntores",
        images: [TINY_BASE64_IMAGE],
        qty: 2,
        unitPrice: 1500,
      },
    ],
    blocks: createFullBuilderPayload().blocks as ProposalDocument["blocks"],
    sectionOrder: createFullBuilderPayload().sectionOrder,
    schedule: [],
    notes: "Validade de 30 dias.",
    signature: {
      preparedBy: "Eletro Tec Dare",
      date: "29 de Junho de 2026",
    },
    financial: {
      discountPercent: 10,
      taxPercent: 5,
    },
    internalCosts: [
      {
        id: INTERNAL_COST_ID,
        description: "Material interno",
        amount: 350,
      },
    ],
    createdAt: "2026-06-29T10:00:00.000Z",
    updatedAt: "2026-06-29T12:00:00.000Z",
    ...overrides,
  };
}
