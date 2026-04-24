"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as orderApi from "../order-api";
import type { OrderDTO } from "../order-types";

export function useOrder(id: string): ReturnType<typeof useQuery<OrderDTO, Error>> {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: Boolean(id),
  });
}
