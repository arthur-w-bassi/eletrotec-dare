"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";
import { listCustomersSchema, type CustomerListDTO } from "../customer-types";

export function useCustomers(
  params?: Partial<z.input<typeof listCustomersSchema>>,
): ReturnType<typeof useQuery<CustomerListDTO, Error>> {
  const normalized = listCustomersSchema.parse(params ?? {});
  return useQuery({
    queryKey: queryKeys.customers.list(normalized),
    queryFn: () => customerApi.getCustomers(params),
  });
}
