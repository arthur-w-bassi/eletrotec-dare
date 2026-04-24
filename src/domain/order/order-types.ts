import { z } from "zod";

function preprocessEmptyStringToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export const orderStatusSchema = z.enum(["DRAFT", "CONFIRMED", "COMPLETED", "CANCELLED"]);

export const createOrderSchema = z.object({
  customerId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Cliente inválido").optional(),
  ),
  notes: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(1000, "Notas devem ter no máximo 1000 caracteres").optional(),
  ),
});

export const updateOrderSchema = z.object({
  customerId: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().uuid("Cliente inválido").optional(),
  ),
  notes: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(1000, "Notas devem ter no máximo 1000 caracteres").optional(),
  ),
  discount: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce.number().min(0, "Desconto deve ser maior ou igual a zero").optional(),
  ),
});

export const addOrderItemSchema = z.object({
  catalogItemId: z.string().uuid("Item do catálogo inválido"),
  quantity: z.coerce
    .number()
    .min(0.001, "Quantidade deve ser pelo menos 0,001"),
  unitPrice: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.coerce.number().min(0, "Preço unitário deve ser maior ou igual a zero").optional(),
  ),
});

export const listOrdersSchema = z.object({
  search: z.preprocess(
    preprocessEmptyStringToUndefined,
    z.string().max(200).optional(),
  ),
  status: z.preprocess(
    preprocessEmptyStringToUndefined,
    orderStatusSchema.optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type UpdateOrderPayload = z.infer<typeof updateOrderSchema>;
export type AddOrderItemPayload = z.infer<typeof addOrderItemSchema>;
export type ListOrdersParams = z.infer<typeof listOrdersSchema>;

export type OrderStatusValue = z.infer<typeof orderStatusSchema>;

export interface OrderItemDTO {
  id: string;
  catalogItemId: string;
  catalogItemName: string;
  catalogItemType: "PRODUCT" | "SERVICE";
  quantity: string;
  unitPrice: string;
  itemTotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: number;
  status: OrderStatusValue;
  customerId: string | null;
  customerName: string | null;
  notes: string | null;
  subtotal: string;
  discount: string;
  total: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

export interface OrderListItemDTO {
  id: string;
  orderNumber: number;
  status: OrderStatusValue;
  customerId: string | null;
  customerName: string | null;
  notes: string | null;
  subtotal: string;
  discount: string;
  total: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}
