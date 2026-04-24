import { z } from "zod";

export const catalogItemTypeSchema = z.enum(["PRODUCT", "SERVICE"]);

export const unitOfMeasureSchema = z.enum([
  "UN",
  "KG",
  "L",
  "M",
  "M2",
  "M3",
  "CX",
  "PCT",
  "HR",
]);

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

const catalogItemFieldsSchema = z.object({
  type: catalogItemTypeSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  description: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  ),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  costPrice: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce.number().min(0, "Custo deve ser maior ou igual a zero").optional(),
  ),
  stockQuantity: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce.number().min(0, "Estoque deve ser maior ou igual a zero").optional(),
  ),
  unit: z.preprocess(
    preprocessEmptyStringToUndefined,
    unitOfMeasureSchema.optional(),
  ),
  barcode: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(50, "Código de barras deve ter no máximo 50 caracteres").optional(),
  ),
  estimatedDurationMinutes: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce
      .number()
      .int("Duração deve ser um número inteiro")
      .positive("Duração deve ser um número inteiro positivo")
      .optional(),
  ),
});

function refineFieldsByType(
  data: z.infer<typeof catalogItemFieldsSchema>,
  ctx: z.RefinementCtx,
): void {
  if (data.type === "SERVICE") {
    if (data.costPrice !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["costPrice"],
        message: "Serviços não possuem custo de aquisição",
      });
    }
    if (data.stockQuantity !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["stockQuantity"],
        message: "Serviços não possuem estoque",
      });
    }
    if (data.unit !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Serviços não possuem unidade de medida",
      });
    }
    if (data.barcode !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["barcode"],
        message: "Serviços não possuem código de barras",
      });
    }
    return;
  }

  if (data.type === "PRODUCT") {
    if (data.costPrice === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["costPrice"],
        message: "Custo é obrigatório para produtos",
      });
    }
    if (data.stockQuantity === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["stockQuantity"],
        message: "Estoque é obrigatório para produtos",
      });
    }
    if (data.unit === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Unidade de medida é obrigatória para produtos",
      });
    }
    if (data.estimatedDurationMinutes !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["estimatedDurationMinutes"],
        message: "Produtos não possuem duração estimada",
      });
    }
  }
}

export const createCatalogItemSchema =
  catalogItemFieldsSchema.superRefine(refineFieldsByType);

// Regras por tipo persistido na atualização: catalog-service (body parcial sem `type`).
export const updateCatalogItemSchema = catalogItemFieldsSchema
  .partial()
  .omit({ type: true })
  .superRefine((data, ctx) => {
    const hasProductField =
      data.barcode !== undefined ||
      data.unit !== undefined ||
      data.stockQuantity !== undefined ||
      data.costPrice !== undefined;
    if (hasProductField && data.estimatedDurationMinutes !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message:
          "Payload não pode misturar campos exclusivos de produto e de serviço",
      });
    }
  });

export const listCatalogItemsSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
  ),
  type: z.preprocess(
    preprocessEmptyStringToUndefined,
    catalogItemTypeSchema.optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  includeInactive: z
    .union([
      z.boolean(),
      z.literal("true"),
      z.literal("false"),
      z.undefined(),
    ])
    .transform((v) => v === true || v === "true")
    .pipe(z.boolean()),
});

export type CreateCatalogItemPayload = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemPayload = z.infer<typeof updateCatalogItemSchema>;
export type ListCatalogItemsParams = z.infer<typeof listCatalogItemsSchema>;

export interface CatalogItemDTO {
  id: string;
  type: z.infer<typeof catalogItemTypeSchema>;
  name: string;
  description: string | null;
  price: string;
  costPrice: string | null;
  stockQuantity: string | null;
  unit: string | null;
  barcode: string | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItemListDTO {
  items: CatalogItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}
