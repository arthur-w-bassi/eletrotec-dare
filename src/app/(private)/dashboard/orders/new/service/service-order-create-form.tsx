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
  serviceOrderCreateFormSchema,
  type ServiceOrderCreateFormValues,
} from "./schema";

const CATALOG_PAGE_SIZE = 100;

const defaultValues: ServiceOrderCreateFormValues = {
  customerId: undefined,
  catalogItemId: undefined,
  customItemName: undefined,
  problem: undefined,
  description: undefined,
  baseValue: 0,
  taxPercent: undefined,
  servicePercent: undefined,
  productPercent: undefined,
  discount: undefined,
  paymentConditionId: undefined,
  paymentStatus: undefined,
};

function buildServiceTypedPayload(values: ServiceOrderCreateFormValues): CreateTypedOrderPayload {
  const payload: CreateTypedOrderPayload = {
    type: "SERVICE",
    baseValue: values.baseValue,
  };
  if (values.customerId !== undefined) payload.customerId = values.customerId;
  if (values.catalogItemId !== undefined) payload.catalogItemId = values.catalogItemId;
  if (values.problem !== undefined) payload.problem = values.problem;
  const itemPrefix = values.customItemName?.trim();
  const finalDesc =
    [itemPrefix, values.description?.trim()].filter(Boolean).join("\n") || undefined;
  if (finalDesc !== undefined) payload.description = finalDesc;
  if (values.taxPercent !== undefined) payload.taxPercent = values.taxPercent;
  if (values.servicePercent !== undefined) payload.servicePercent = values.servicePercent;
  if (values.productPercent !== undefined) payload.productPercent = values.productPercent;
  if (values.discount !== undefined) payload.discount = values.discount;
  if (values.paymentConditionId !== undefined) payload.paymentConditionId = values.paymentConditionId;
  if (values.paymentStatus !== undefined) payload.paymentStatus = values.paymentStatus;
  return payload;
}

function dedupeDescriptions(items: CatalogItemDTO[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of items) {
    const d = row.description?.trim();
    if (!d) continue;
    if (seen.has(d)) continue;
    seen.add(d);
    out.push(d);
  }
  out.sort((a, b) => a.localeCompare(b, "pt-BR"));
  return out;
}

export function ServiceOrderCreateForm(): React.ReactElement {
  const router = useRouter();
  const [draftCatalogSearch, setDraftCatalogSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState<string | undefined>(undefined);

  const catalogParams = useMemo(
    () => ({
      search: catalogSearch,
      type: "SERVICE" as const,
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

  const descriptionOptions = useMemo(
    () => dedupeDescriptions(catalogData?.items ?? []),
    [catalogData?.items],
  );

  const [descriptionPreset, setDescriptionPreset] = useState("");

  const form = useForm<ServiceOrderCreateFormValues>({
    resolver: zodResolver(serviceOrderCreateFormSchema) as Resolver<ServiceOrderCreateFormValues>,
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
    form.setValue("customItemName", undefined);
    if (row) {
      const n = Number.parseFloat(row.price);
      if (!Number.isNaN(n)) {
        form.setValue("baseValue", n);
      }
    }
  }

  const catalogItemIdField = form.register("catalogItemId");
  const catalogItemId = form.watch("catalogItemId");

  const catalogBlockDisabled =
    createTyped.isPending || (catalogPending && catalogData === undefined);

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((data) => createTyped.mutate(buildServiceTypedPayload(data)))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <OrderCustomerFields
        form={form}
        fieldIdSuffix="service"
        disabled={createTyped.isPending}
      />

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <span className="text-[0.875rem] font-medium">Produto do catálogo (opcional)</span>
        {catalogPending && catalogData === undefined ? (
          <p className="text-[0.8125rem] text-zinc-500">A carregar catálogo…</p>
        ) : null}
        {catalogIsError ? (
          <p className="text-[0.8125rem] text-red-600">
            {catalogError instanceof Error ? catalogError.message : "Não foi possível carregar o catálogo."} Podes
            continuar e preencher a descrição manualmente.
          </p>
        ) : null}
        {catalogFetching && catalogData !== undefined && !catalogPending ? (
          <p className="text-[0.8125rem] text-zinc-500">A atualizar resultados…</p>
        ) : null}
        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label
              className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400"
              htmlFor="service-order-catalog-search"
            >
              Pesquisar catálogo
            </label>
            <input
              id="service-order-catalog-search"
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
          <label className="text-[0.875rem] font-medium" htmlFor="service-order-catalog-item">
            Item de serviço
          </label>
          <select
            id="service-order-catalog-item"
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
        {!catalogItemId ? (
          <div className="flex flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="service-order-custom-item-name">
              Nome do item (livre, sem catálogo)
            </label>
            <input
              id="service-order-custom-item-name"
              type="text"
              disabled={createTyped.isPending}
              placeholder="Ex.: Motor de lavadora LG — peça do cliente"
              className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
              {...form.register("customItemName")}
            />
            {form.formState.errors.customItemName ? (
              <p className="text-[0.8125rem] text-red-600">
                {form.formState.errors.customItemName.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <label className="text-[0.875rem] font-medium" htmlFor="service-order-problem">
          Problema (opcional)
        </label>
        <input
          id="service-order-problem"
          type="text"
          disabled={createTyped.isPending}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("problem")}
        />
        {form.formState.errors.problem ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.problem.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <span className="text-[0.875rem] font-medium">Descrição</span>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400" htmlFor="service-order-desc-preset">
            Descrições do catálogo (pré-definidas)
          </label>
          <select
            id="service-order-desc-preset"
            disabled={catalogBlockDisabled}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            value={descriptionPreset}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return;
              form.setValue("description", v, { shouldValidate: true, shouldDirty: true });
              setDescriptionPreset("");
            }}
          >
            <option value="">Selecionar para preencher…</option>
            {descriptionOptions.map((d) => (
              <option key={d} value={d} title={d}>
                {d.length > 80 ? `${d.slice(0, 80)}…` : d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="service-order-description">
            Descrição (editável)
          </label>
          <textarea
            id="service-order-description"
            rows={4}
            disabled={createTyped.isPending}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>
      </div>

      <OrderValueFields form={form} disabled={createTyped.isPending} fieldIdSuffix="service" />
      <OrderDiscountField form={form} disabled={createTyped.isPending} fieldIdSuffix="service" />
      <OrderPaymentFields
        form={form}
        conditions={[]}
        disabled={createTyped.isPending}
        fieldIdSuffix="service"
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
