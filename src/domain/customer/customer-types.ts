import { z } from "zod";

export const personTypeSchema = z.enum(["PF", "PJ"]);

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(digits[i]!, 10) * (10 - i);
  }
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number.parseInt(digits[9]!, 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(digits[i]!, 10) * (11 - i);
  }
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number.parseInt(digits[10]!, 10);
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits)) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number.parseInt(digits[i]!, 10) * weights1[i]!;
  }
  let d1 = sum % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  if (d1 !== Number.parseInt(digits[12]!, 10)) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number.parseInt(digits[i]!, 10) * weights2[i]!;
  }
  let d2 = sum % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  return d2 === Number.parseInt(digits[13]!, 10);
}

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function preprocessOptionalDocument(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  const digits = normalizeDigits(value);
  return digits === "" ? undefined : digits;
}

function preprocessOptionalPhone(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  const digits = normalizeDigits(value);
  return digits === "" ? undefined : digits;
}

function preprocessOptionalZip(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  const digits = normalizeDigits(value);
  return digits === "" ? undefined : digits;
}

function preprocessOptionalState(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  const t = value.trim();
  return t === "" ? undefined : t.toUpperCase();
}

const customerFieldsSchema = z.object({
  type: personTypeSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  tradeName: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200, "Nome fantasia deve ter no máximo 200 caracteres").optional(),
  ),
  document: z.preprocess(
    preprocessOptionalDocument,
    z.string().optional(),
  ),
  email: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().email("Email inválido").optional(),
  ),
  phone: z.preprocess(
    preprocessOptionalPhone,
    z
      .string()
      .refine(
        (d) => d.length === 10 || d.length === 11,
        "Telefone inválido (10 ou 11 dígitos com DDD)",
      )
      .optional(),
  ),
  secondaryPhone: z.preprocess(
    preprocessOptionalPhone,
    z
      .string()
      .refine(
        (d) => d.length === 10 || d.length === 11,
        "Telefone secundário inválido (10 ou 11 dígitos com DDD)",
      )
      .optional(),
  ),
  zipCode: z.preprocess(
    preprocessOptionalZip,
    z.string().length(8, "CEP deve ter 8 dígitos").optional(),
  ),
  state: z.preprocess(
    preprocessOptionalState,
    z
      .string()
      .length(2, "UF deve ter 2 letras")
      .regex(/^[A-Z]{2}$/, "UF inválida")
      .optional(),
  ),
  city: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(100, "Cidade deve ter no máximo 100 caracteres").optional(),
  ),
  neighborhood: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(100, "Bairro deve ter no máximo 100 caracteres").optional(),
  ),
  street: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200, "Logradouro deve ter no máximo 200 caracteres").optional(),
  ),
  number: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(20, "Número deve ter no máximo 20 caracteres").optional(),
  ),
  complement: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(100, "Complemento deve ter no máximo 100 caracteres").optional(),
  ),
  notes: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(500, "Notas devem ter no máximo 500 caracteres").optional(),
  ),
});

function refineDocumentMatchesType(
  data: { type?: "PF" | "PJ"; document?: string | undefined },
  ctx: z.RefinementCtx,
): void {
  if (!data.document) return;
  if (data.type === undefined) return;
  if (data.type === "PF" && !isValidCpf(data.document)) {
    ctx.addIssue({
      code: "custom",
      path: ["document"],
      message: "CPF inválido",
    });
  }
  if (data.type === "PJ" && !isValidCnpj(data.document)) {
    ctx.addIssue({
      code: "custom",
      path: ["document"],
      message: "CNPJ inválido",
    });
  }
}

export const createCustomerSchema = customerFieldsSchema.superRefine(
  refineDocumentMatchesType,
);

export const updateCustomerSchema = customerFieldsSchema
  .partial()
  .superRefine(refineDocumentMatchesType);

export const listCustomersSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
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

export const cnpjSchema = z.string().regex(/^\d{14}$/, "CNPJ inválido");

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerPayload = z.infer<typeof updateCustomerSchema>;
export type ListCustomersParams = z.infer<typeof listCustomersSchema>;

export interface CustomerDTO {
  id: string;
  type: z.infer<typeof personTypeSchema>;
  name: string;
  tradeName: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  secondaryPhone: string | null;
  zipCode: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListDTO {
  items: CustomerDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CnpjLookupDTO {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  zipCode: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
}
