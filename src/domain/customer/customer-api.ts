import type { z } from "zod";

import { api } from "@/api/api";
import { apiPaths } from "@/api/api-paths";
import { ApiClientError, handleApiResponse } from "@/domain/utils/api-utils";

import {
  cnpjSchema,
  listCustomersSchema,
  normalizeDigits,
  type CnpjLookupDTO,
  type CreateCustomerPayload,
  type CustomerDTO,
  type CustomerListDTO,
  type UpdateCustomerPayload,
} from "./customer-types";

export async function postCustomer(payload: CreateCustomerPayload): Promise<CustomerDTO> {
  const res = await api.post(apiPaths.customers.create, { json: payload });
  return handleApiResponse<CustomerDTO>(res);
}

export async function getCustomers(
  params?: Partial<z.input<typeof listCustomersSchema>>,
): Promise<CustomerListDTO> {
  const parsed = listCustomersSchema.parse(params ?? {});
  const searchParams: Record<string, string> = {
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
    includeInactive: String(parsed.includeInactive),
  };
  if (parsed.search !== undefined) {
    searchParams.search = parsed.search;
  }
  const res = await api.get(apiPaths.customers.list, { searchParams });
  return handleApiResponse<CustomerListDTO>(res);
}

export async function getCustomerById(id: string): Promise<CustomerDTO> {
  const res = await api.get(apiPaths.customers.details(id));
  return handleApiResponse<CustomerDTO>(res);
}

export async function putCustomer(id: string, payload: UpdateCustomerPayload): Promise<CustomerDTO> {
  const res = await api.put(apiPaths.customers.update(id), { json: payload });
  return handleApiResponse<CustomerDTO>(res);
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await api.delete(apiPaths.customers.delete(id));
  await handleApiResponse<null>(res);
}

export async function getCustomerCnpjLookup(cnpj: string): Promise<CnpjLookupDTO> {
  const digits = normalizeDigits(cnpj);
  const parsed = cnpjSchema.safeParse(digits);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "CNPJ inválido";
    throw new ApiClientError(400, "VALIDATION_ERROR", first);
  }
  const res = await api.get(apiPaths.customers.cnpjLookup(parsed.data));
  return handleApiResponse<CnpjLookupDTO>(res);
}
