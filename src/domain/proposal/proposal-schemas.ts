import { z } from "zod";

import { MAX_SERVICE_IMAGES } from "./proposal-types";

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

const MAX_IMAGE_STRING_LENGTH = 7 * 1024 * 1024;

const proposalLineItemImageSchema = z
  .string()
  .refine(
    (value) =>
      value.startsWith("https://") ||
      value.startsWith("http://") ||
      /^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(value),
    { message: "Imagem deve ser uma URL http(s) ou data URL de imagem" },
  )
  .refine((value) => value.length <= MAX_IMAGE_STRING_LENGTH, {
    message: "Imagem excede o tamanho máximo permitido (5 MB)",
  });

const proposalScheduleItemSchema = z.object({
  id: z.string().uuid(),
  period: z.string().max(500),
  activity: z.string().max(1000),
  notes: z.string().max(2000),
});

const proposalBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().uuid(),
    type: z.literal("text"),
    content: z.string().max(50000),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("heading"),
    content: z.string().max(500),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("divider"),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("image"),
    alt: z.string().max(500),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("schedule"),
    items: z.array(proposalScheduleItemSchema),
  }),
]);

const proposalCoverPayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(300, "Título deve ter no máximo 300 caracteres"),
  client: z.string().trim().max(300, "Cliente deve ter no máximo 300 caracteres"),
  clientAddress: z.string().max(1000).optional().default(""),
  clientDocument: z.string().max(100).optional().default(""),
  clientContact: z.string().max(200).optional().default(""),
  customerId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Cliente inválido").optional().nullable(),
  ),
  number: z.string().optional(),
  date: z.string().optional(),
});

const proposalSignatureSchema = z.object({
  preparedBy: z.string().max(200),
  date: z.string().max(100),
});

const proposalFinancialSchema = z.object({
  discountPercent: z.coerce.number().min(0).max(100),
  taxPercent: z.coerce.number().min(0).max(100),
});

const proposalLineItemPayloadSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Serviço inválido").optional(),
  ),
  title: z
    .string()
    .trim()
    .min(1, "Título do serviço é obrigatório")
    .max(300),
  description: z.string().max(5000).default(""),
  images: z.array(proposalLineItemImageSchema).max(MAX_SERVICE_IMAGES),
  qty: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.coerce.number().min(0, "Preço unitário deve ser maior ou igual a zero"),
});

const proposalInternalCostPayloadSchema = z.object({
  id: z.string().uuid(),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória")
    .max(500),
  amount: z.coerce.number().min(0, "Valor deve ser maior ou igual a zero"),
});

export const proposalDocumentPayloadSchema = z.object({
  cover: proposalCoverPayloadSchema,
  introduction: z.string().max(50000).default(""),
  notes: z.string().max(50000).default(""),
  signature: proposalSignatureSchema,
  financial: proposalFinancialSchema,
  lineItems: z.array(proposalLineItemPayloadSchema),
  internalCosts: z.array(proposalInternalCostPayloadSchema).default([]),
  blocks: z.array(proposalBlockSchema).default([]),
  sectionOrder: z.array(z.string()).optional(),
});

export const createProposalSchema = proposalDocumentPayloadSchema;
export const updateProposalSchema = proposalDocumentPayloadSchema;
export const completeProposalSchema = z.object({});

export const proposalStatusSchema = z.enum(["draft", "completed"]);

export const uiServiceCategorySchema = z.enum([
  "Electrical",
  "HVAC",
  "Plumbing",
  "Maintenance",
  "Inspection",
]);

export const listProposalsSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
  ),
  status: z.preprocess(
    preprocessEmptyStringToUndefined,
    proposalStatusSchema.optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const listProposalTemplatesSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
  ),
  category: z.preprocess(
    preprocessEmptyStringToUndefined,
    uiServiceCategorySchema.optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ProposalDocumentPayload = z.infer<typeof proposalDocumentPayloadSchema>;
export type CreateProposalPayload = z.infer<typeof createProposalSchema>;
export type UpdateProposalPayload = z.infer<typeof updateProposalSchema>;
export type ListProposalsParams = z.infer<typeof listProposalsSchema>;
export type ListProposalTemplatesParams = z.infer<typeof listProposalTemplatesSchema>;
export type ProposalStatusFilter = z.infer<typeof proposalStatusSchema>;
