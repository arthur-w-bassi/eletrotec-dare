"use client";

import { useMemo, useState } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { useCustomers } from "@/domain/customer/useCases/use-customers";

export const ORDER_CUSTOMER_LIST_PAGE_SIZE = 50;

export interface OrderCustomerFieldsProps<TFieldValues extends FieldValues & { customerId?: string }> {
  form: UseFormReturn<TFieldValues>;
  disabled?: boolean;
  /** Texto do cabeçalho do bloco (default: "Cliente (opcional)") */
  title?: string;
  /** Sufixo para `id`/`htmlFor` únicos quando existirem vários formulários na página */
  fieldIdSuffix?: string;
}

export function OrderCustomerFields<TFieldValues extends FieldValues & { customerId?: string }>({
  form,
  disabled = false,
  title = "Cliente (opcional)",
  fieldIdSuffix = "new",
}: OrderCustomerFieldsProps<TFieldValues>): React.ReactElement {
  const [draftCustomerSearch, setDraftCustomerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState<string | undefined>(undefined);

  const customerParams = useMemo(
    () => ({
      search: customerSearch,
      page: 1,
      pageSize: ORDER_CUSTOMER_LIST_PAGE_SIZE,
      includeInactive: false,
    }),
    [customerSearch],
  );

  const { data: customersData } = useCustomers(customerParams);

  function applyCustomerSearch(): void {
    setCustomerSearch(draftCustomerSearch.trim() === "" ? undefined : draftCustomerSearch.trim());
  }

  const sid = fieldIdSuffix.trim() === "" ? "default" : fieldIdSuffix.trim();

  const customerIdError = form.formState.errors.customerId as
    | { message?: string }
    | undefined;

  return (
    <div className="flex flex-col gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <span className="text-[0.875rem] font-medium">{title}</span>
      <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
          <label
            className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400"
            htmlFor={`order-${sid}-customer-search`}
          >
            Pesquisar cliente
          </label>
          <input
            id={`order-${sid}-customer-search`}
            type="search"
            disabled={disabled}
            value={draftCustomerSearch}
            onChange={(e) => setDraftCustomerSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyCustomerSearch();
              }
            }}
            placeholder="Nome ou documento"
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900 disabled:opacity-50"
          onClick={applyCustomerSearch}
        >
          Aplicar
        </button>
      </div>
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-customer-id`}>
          Selecionar
        </label>
        <select
          id={`order-${sid}-customer-id`}
          disabled={disabled}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("customerId" as FieldPath<TFieldValues>)}
        >
          <option value="">Sem cliente</option>
          {customersData?.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.document ? ` — ${c.document}` : ""}
            </option>
          ))}
        </select>
        {customerIdError?.message ? (
          <p className="text-[0.8125rem] text-red-600">{customerIdError.message}</p>
        ) : null}
      </div>
    </div>
  );
}
