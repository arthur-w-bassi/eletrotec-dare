"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as customerApi from "../customer-api";
import type { CnpjLookupDTO } from "../customer-types";

type CnpjLookupQueryOptions = Pick<
  UseQueryOptions<CnpjLookupDTO, Error, CnpjLookupDTO>,
  "enabled" | "staleTime" | "retry"
>;

export function useCnpjLookup(
  cnpj14: string,
  options?: CnpjLookupQueryOptions,
): ReturnType<typeof useQuery<CnpjLookupDTO, Error>> {
  const { enabled, staleTime, retry } = options ?? {};
  return useQuery({
    queryKey: queryKeys.customers.cnpj(cnpj14),
    queryFn: () => customerApi.getCustomerCnpjLookup(cnpj14),
    enabled: enabled ?? cnpj14.length === 14,
    staleTime: staleTime ?? 86_400_000,
    retry: retry ?? false,
  });
}
