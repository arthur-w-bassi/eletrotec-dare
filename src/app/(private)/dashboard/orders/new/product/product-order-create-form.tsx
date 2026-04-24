"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import type { CatalogItemDTO } from "@/domain/catalog/catalog-types";
import { useCatalogItems } from "@/domain/catalog/useCases/use-catalog-items";
import type { CreateTypedOrderPayload } from "@/domain/order/order-api";
import { useCreateTypedOrder } from "@/domain/order/useCases/use-create-typed-order";
import { ApiClientError } from "@/domain/utils/api-utils";

import { OrderCustomerFields } from "../components/order-customer-fields";
import { OrderDiscountField } from "../components/order-discount-field";
import { OrderPaymentFields } from "../components/order-payment-fields";
import { OrderTotalDisplay } from "../components/order-total-display";
import { OrderValueFields } from "../components/order-value-fields";
import {
  productOrderCreateFormSchema,
  type ProductOrderCreateFormValues,
} from "./schema";

const CATALOG_PAGE_SIZE = 100;

const defaultValues: ProductOrderCreateFormValues = {
  customerId: undefined,
  catalogItemId: undefined,
  notes: undefined,
  baseValue: 0,
  taxPercent: undefined,
  servicePercent: undefined,
  productPercent: undefined,
  discount: undefined,
  paymentConditionId: undefined,
  paymentStatus: undefined,
};

function buildProductTypedPayload(values: ProductOrderCreateFormValues): CreateTypedOrderPayload {
  const payload: CreateTypedOrderPayload = {
    type: "PRODUCT",
    baseValue: values.baseValue,
  };
  if (values.customerId !== undefined) payload.customerId = values.customerId;
  if (values.catalogItemId !== undefined) payload.catalogItemId = values.catalogItemId;
  if (values.notes !== undefined) payload.notes = values.notes;
  if (values.taxPercent !== undefined) payload.taxPercent = values.taxPercent;
  if (values.servicePercent !== undefined) payload.servicePercent = values.servicePercent;
  if (values.productPercent !== undefined) payload.productPercent = values.productPercent;
  if (values.discount !== undefined) payload.discount = values.discount;
  if (values.paymentConditionId !== undefined) payload.paymentConditionId = values.paymentConditionId;
  if (values.paymentStatus !== undefined) payload.paymentStatus = values.paymentStatus;
  return payload;
}

export function ProductOrderCreateForm(): React.ReactElement {
  const router = useRouter();
  const [draftCatalogSearch, setDraftCatalogSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState<string | undefined>(undefined);

  const catalogParams = useMemo(
    () => ({
      search: catalogSearch,
      type: "PRODUCT" as const,
      page: 1,
      pageSize: CATALOG_PAGE_SIZE,
      includeInactive: false,
    }),
    [catalogSearch],
  );

  const catalogQuery = useCatalogItems(catalogParams);
  const {
    data: catalogData,
    isPending: catalogPending,
    isError: catalogIsError,
    error: catalogError,
    isFetching: catalogFetching,
  } = catalogQuery;

  const form = useForm<ProductOrderCreateFormValues>({
    resolver: zodResolver(productOrderCreateFormSchema) as Resolver<ProductOrderCreateFormValues>,
    defaultValues,
  });

  const createTyped = useCreateTypedOrder({
    onSuccess: (data) => {
      router.push(`/dashboard/orders/${data.id}`);
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  function applyCatalogSearch(): void {
    setCatalogSearch(draftCatalogSearch.trim() === "" ? undefined : draftCatalogSearch.trim());
  }

  function applyCatalogItemSelection(id: string, items: CatalogItemDTO[]): void {
    if (id === "") {
      form.setValue("catalogItemId", undefined);
      return;
    }
    const row = items.find((i) => i.id === id);
    form.setValue("catalogItemId", id);
    if (row) {
      const n = Number.parseFloat(row.price);
      if (!Number.isNaN(n)) {
        form.setValue("baseValue", n);
      }
    }
  }

  const catalogItemIdField = form.register("catalogItemId");

  const catalogBlockDisabled =
    createTyped.isPending || (catalogPending && catalogData === undefined);

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((data) => createTyped.mutate(buildProductTypedPayload(data)))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <OrderCustomerFields
        form={form}
        fieldIdSuffix="product"
        disabled={createTyped.isPending}
      />

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <span className="text-[0.875rem] font-medium">Produto do catálogo (opcional)</span>
        {catalogPending && catalogData === undefined ? (
          <p className="text-[0.8125rem] text-zinc-500">A carregar catálogo…</p>
        ) : null}
        {catalogIsError ? (
          <p className="text-[0.8125rem] text-red-600">
            {catalogError instanceof Error ? catalogError.message : "Não foi possível carregar o catálogo."}{" "}
            Podes continuar e preencher o valor base manualmente.
          </p>
        ) : null}
        {catalogFetching && catalogData !== undefined && !catalogPending ? (
          <p className="text-[0.8125rem] text-zinc-500">A atualizar resultados…</p>
        ) : null}
        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label
              className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400"
              htmlFor="product-order-catalog-search"
            >
              Pesquisar catálogo
            </label>
            <input
              id="product-order-catalog-search"
              type="search"
              disabled={catalogBlockDisabled}
              value={draftCatalogSearch}
              onChange={(e) => setDraftCatalogSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCatalogSearch();
                }
              }}
              placeholder="Nome ou descrição"
              className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            />
          </div>
          <button
            type="button"
            disabled={catalogBlockDisabled}
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900 disabled:opacity-50"
            onClick={applyCatalogSearch}
          >
            Aplicar
          </button>
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="product-order-catalog-item">
            Item de produto
          </label>
          <select
            id="product-order-catalog-item"
            disabled={catalogBlockDisabled}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...catalogItemIdField}
            onChange={(e) => {
              void catalogItemIdField.onChange(e);
              applyCatalogItemSelection(e.target.value, catalogData?.items ?? []);
            }}
          >
            <option value="">Sem item</option>
            {catalogData?.items.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
          {form.formState.errors.catalogItemId ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.catalogItemId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <span className="text-[0.875rem] font-medium">Observação</span>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="product-order-notes">
            Observação (opcional)
          </label>
          <textarea
            id="product-order-notes"
            rows={4}
            disabled={createTyped.isPending}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("notes")}
          />
          {form.formState.errors.notes ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.notes.message}</p>
          ) : null}
        </div>
      </div>

      <OrderValueFields form={form} disabled={createTyped.isPending} fieldIdSuffix="product" />
      <OrderDiscountField form={form} disabled={createTyped.isPending} fieldIdSuffix="product" />
      <OrderPaymentFields
        form={form}
        conditions={[]}
        disabled={createTyped.isPending}
        fieldIdSuffix="product"
      />
      <OrderTotalDisplay form={form} />

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={createTyped.isPending}
        >
          {createTyped.isPending ? "A criar…" : "Criar pedido"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href="/dashboard/orders/new"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
