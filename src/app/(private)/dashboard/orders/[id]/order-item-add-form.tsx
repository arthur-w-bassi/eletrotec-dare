"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import type { CatalogItemDTO } from "@/domain/catalog/catalog-types";
import { useCatalogItems } from "@/domain/catalog/useCases/use-catalog-items";
import {
  addOrderItemSchema,
  type AddOrderItemPayload,
} from "@/domain/order/order-types";
import { useAddOrderItem } from "@/domain/order/useCases/use-add-order-item";
import { ApiClientError } from "@/domain/utils/api-utils";

const CATALOG_PAGE_SIZE = 20;

export function OrderItemAddForm({ orderId }: { orderId: string }): React.ReactElement {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);

  const catalogParams = useMemo(
    () => ({
      search,
      page: 1,
      pageSize: CATALOG_PAGE_SIZE,
      includeInactive: false,
    }),
    [search],
  );

  const { data: catalogData } = useCatalogItems(catalogParams);

  const form = useForm<AddOrderItemPayload>({
    resolver: zodResolver(addOrderItemSchema) as Resolver<AddOrderItemPayload>,
    defaultValues: {
      catalogItemId: "",
      quantity: 1,
      unitPrice: undefined,
    },
  });

  const addItem = useAddOrderItem({
    onSuccess: () => {
      form.reset({
        catalogItemId: "",
        quantity: 1,
        unitPrice: undefined,
      });
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  function applySearch(): void {
    setSearch(draftSearch.trim() === "" ? undefined : draftSearch.trim());
  }

  function applyCatalogSelection(id: string, items: CatalogItemDTO[]): void {
    if (id === "") {
      form.setValue("catalogItemId", "");
      form.setValue("unitPrice", undefined);
      return;
    }
    const row = items.find((i) => i.id === id);
    form.setValue("catalogItemId", id);
    if (row) {
      const n = Number.parseFloat(row.price);
      form.setValue("unitPrice", Number.isNaN(n) ? undefined : n);
    }
  }

  const catalogItemIdField = form.register("catalogItemId");

  return (
    <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <h3 className="text-[1rem] font-semibold">Adicionar item</h3>
      <form
        className="flex flex-col gap-[0.75rem]"
        onSubmit={form.handleSubmit((payload) => addItem.mutate({ orderId, payload }))}
      >
        {form.formState.errors.root ? (
          <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400" htmlFor="order-item-catalog-search">
              Pesquisar catálogo
            </label>
            <input
              id="order-item-catalog-search"
              type="search"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              placeholder="Nome, descrição ou código de barras (só dígitos)"
              className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            />
          </div>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
            onClick={applySearch}
          >
            Aplicar
          </button>
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="order-item-catalog-id">
            Item do catálogo
          </label>
          <select
            id="order-item-catalog-id"
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...catalogItemIdField}
            onChange={(e) => {
              void catalogItemIdField.onChange(e);
              applyCatalogSelection(e.target.value, catalogData?.items ?? []);
            }}
          >
            <option value="">Selecionar…</option>
            {catalogData?.items.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
                {row.type === "PRODUCT" && row.barcode ? ` — ${row.barcode}` : ""}
              </option>
            ))}
          </select>
          {form.formState.errors.catalogItemId ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.catalogItemId.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-[0.25rem] sm:max-w-[12rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="order-item-qty">
            Quantidade
          </label>
          <input
            id="order-item-qty"
            type="number"
            step="any"
            min={0.001}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("quantity", { valueAsNumber: true })}
          />
          {form.formState.errors.quantity ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.quantity.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-[0.25rem] sm:max-w-[12rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="order-item-unit-price">
            Preço unitário (opcional)
          </label>
          <input
            id="order-item-unit-price"
            type="number"
            step="any"
            min={0}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("unitPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.unitPrice ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.unitPrice.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-fit rounded-full bg-foreground px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={addItem.isPending}
        >
          {addItem.isPending ? "A adicionar…" : "Adicionar ao pedido"}
        </button>
      </form>
    </div>
  );
}
