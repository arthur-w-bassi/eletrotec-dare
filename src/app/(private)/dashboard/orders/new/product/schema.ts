import { z } from "zod";

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export const productOrderCreateFormSchema = z.object({
  customerId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Cliente inválido").optional(),
  ),
  catalogItemId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Item do catálogo inválido").optional(),
  ),
  notes: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(1000, "Observação deve ter no máximo 1000 caracteres").optional(),
  ),
  baseValue: z.coerce
    .number()
    .finite("Valor base inválido")
    .min(0, "Valor base deve ser maior ou igual a zero"),
  taxPercent: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce
      .number()
      .finite("% Imposto inválido")
      .min(0, "% Imposto deve ser maior ou igual a zero")
      .optional(),
  ),
  servicePercent: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce
      .number()
      .finite("% Serviço inválido")
      .min(0, "% Serviço deve ser maior ou igual a zero")
      .optional(),
  ),
  productPercent: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce
      .number()
      .finite("% Produto inválido")
      .min(0, "% Produto deve ser maior ou igual a zero")
      .optional(),
  ),
  discount: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce
      .number()
      .finite("Desconto inválido")
      .min(0, "Desconto deve ser maior ou igual a zero")
      .optional(),
  ),
  paymentConditionId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Condição inválida").optional(),
  ),
  paymentStatus: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.enum(["PENDING", "PARTIAL", "PAID"]).optional(),
  ),
});

export type ProductOrderCreateFormValues = z.infer<typeof productOrderCreateFormSchema>;
