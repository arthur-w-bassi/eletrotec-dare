"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";
import type { OrderListDTO } from "../order-api";
import { listOrdersSchema } from "../order-types";

export function useOrders(
  params?: Partial<z.input<typeof listOrdersSchema>>,
): ReturnType<typeof useQuery<OrderListDTO, Error>> {
  const normalized = listOrdersSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.orders.list(normalized),
    queryFn: () => orderApi.getOrders(params),
  });
}
