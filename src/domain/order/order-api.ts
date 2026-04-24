import type { z } from "zod";

import { api } from "@/api/api";
import { apiPaths } from "@/api/api-paths";
import { handleApiResponse } from "@/domain/utils/api-utils";

import {
  listOrdersSchema,
  type AddOrderItemPayload,
  type CreateOrderPayload,
  type OrderDTO,
  type OrderListItemDTO,
  type UpdateOrderPayload,
} from "./order-types";

/** Alinhado ao enum `PaymentStatus` do backend (Fase 1). */
export type PaymentStatusValue = "PENDING" | "PARTIAL" | "PAID";

/**
 * Payload para `POST /api/orders` com discriminação por `type` (pedido serviço vs produto).
 * Quando existir `createTypedOrderSchema` em `order-types.ts` (Fase 2b), preferir `z.infer<typeof createTypedOrderSchema>` e reexportar daqui se necessário.
 */
export type CreateTypedOrderPayload =
  | {
      type: "SERVICE";
      customerId?: string;
      catalogItemId?: string;
      problem?: string;
      description?: string;
      baseValue: number;
      taxPercent?: number;
      servicePercent?: number;
      productPercent?: number;
      paymentConditionId?: string;
      paymentStatus?: PaymentStatusValue;
      discount?: number;
    }
  | {
      type: "PRODUCT";
      customerId?: string;
      catalogItemId?: string;
      notes?: string;
      baseValue: number;
      taxPercent?: number;
      servicePercent?: number;
      productPercent?: number;
      paymentConditionId?: string;
      paymentStatus?: PaymentStatusValue;
      discount?: number;
    };

export interface OrderListDTO {
  items: OrderListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export async function postOrder(payload: CreateOrderPayload): Promise<OrderDTO> {
  const res = await api.post(apiPaths.orders.create, { json: payload });
  return handleApiResponse<OrderDTO>(res);
}

/** Criação tipada (SERVICE/PRODUCT) no mesmo endpoint que `postOrder`; usa path semântico `createTyped`. */
export async function postTypedOrder(payload: CreateTypedOrderPayload): Promise<OrderDTO> {
  const res = await api.post(apiPaths.orders.createTyped, { json: payload });
  return handleApiResponse<OrderDTO>(res);
}

export async function getOrders(
  params?: Partial<z.input<typeof listOrdersSchema>>,
): Promise<OrderListDTO> {
  const parsed = listOrdersSchema.parse(params ?? {});
  const searchParams: Record<string, string> = {
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
  };
  if (parsed.search !== undefined) {
    searchParams.search = parsed.search;
  }
  if (parsed.status !== undefined) {
    searchParams.status = parsed.status;
  }
  const res = await api.get(apiPaths.orders.list, { searchParams });
  return handleApiResponse<OrderListDTO>(res);
}

export async function getOrderById(id: string): Promise<OrderDTO> {
  const res = await api.get(apiPaths.orders.details(id));
  return handleApiResponse<OrderDTO>(res);
}

export async function putOrder(id: string, payload: UpdateOrderPayload): Promise<OrderDTO> {
  const res = await api.put(apiPaths.orders.update(id), { json: payload });
  return handleApiResponse<OrderDTO>(res);
}

/** Cancelamento lógico do pedido (HTTP DELETE). */
export async function deleteOrder(id: string): Promise<OrderDTO> {
  const res = await api.delete(apiPaths.orders.delete(id));
  return handleApiResponse<OrderDTO>(res);
}

export async function postOrderItem(
  orderId: string,
  payload: AddOrderItemPayload,
): Promise<OrderDTO> {
  const res = await api.post(apiPaths.orders.addItem(orderId), { json: payload });
  return handleApiResponse<OrderDTO>(res);
}

export async function deleteOrderItem(orderId: string, itemId: string): Promise<OrderDTO> {
  const res = await api.delete(apiPaths.orders.removeItem(orderId, itemId));
  return handleApiResponse<OrderDTO>(res);
}

export async function postOrderConfirm(id: string): Promise<OrderDTO> {
  const res = await api.post(apiPaths.orders.confirm(id));
  return handleApiResponse<OrderDTO>(res);
}

export async function postOrderComplete(id: string): Promise<OrderDTO> {
  const res = await api.post(apiPaths.orders.complete(id));
  return handleApiResponse<OrderDTO>(res);
}
