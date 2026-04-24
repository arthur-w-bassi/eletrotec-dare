"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";
import type { CustomerDTO } from "../customer-types";

export function useCustomer(id: string): ReturnType<typeof useQuery<CustomerDTO, Error>> {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customerApi.getCustomerById(id),
    enabled: Boolean(id),
  });
}
