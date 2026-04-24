"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  updateOrderSchema,
  type UpdateOrderPayload,
} from "@/domain/order/order-types";
import { useOrder } from "@/domain/order/useCases/use-order";
import { useUpdateOrder } from "@/domain/order/useCases/use-update-order";
import { useCustomers } from "@/domain/customer/useCases/use-customers";
import { ApiClientError } from "@/domain/utils/api-utils";

const CUSTOMER_PAGE_SIZE = 50;

interface OrderEditFormProps {
  id: string;
}

export function OrderEditForm({ id }: OrderEditFormProps): React.ReactElement {
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useOrder(id);

  const [draftCustomerSearch, setDraftCustomerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState<string | undefined>(undefined);

  const customerParams = useMemo(
    () => ({
      search: customerSearch,
      page: 1,
      pageSize: CUSTOMER_PAGE_SIZE,
      includeInactive: false,
    }),
    [customerSearch],
  );

  const { data: customersData } = useCustomers(customerParams);

  const form = useForm<UpdateOrderPayload>({
    resolver: zodResolver(updateOrderSchema) as Resolver<UpdateOrderPayload>,
    defaultValues: {
      customerId: undefined,
      notes: "",
      discount: undefined,
    },
  });

  useEffect(() => {
    if (!order) return;
    if (order.status !== "DRAFT") return;
    const disc = Number.parseFloat(order.discount);
    form.reset({
      customerId: order.customerId ?? undefined,
      notes: order.notes ?? "",
      discount: Number.isNaN(disc) ? 0 : disc,
    });
  }, [order, form]);

  const update = useUpdateOrder({
    onSuccess: () => {
      router.push(`/dashboard/orders/${id}`);
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

  function applyCustomerSearch(): void {
    setCustomerSearch(draftCustomerSearch.trim() === "" ? undefined : draftCustomerSearch.trim());
  }

  const notFound =
    isError &&
    error instanceof ApiClientError &&
    (error.status === 404 || error.code === "NOT_FOUND" || error.code === "VALIDATION_ERROR");

  if (isLoading) {
    return <p className="text-[0.9375rem] text-zinc-500">A carregar…</p>;
  }

  if (notFound) {
    return (
      <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <p className="text-[0.9375rem]">Pedido não encontrado.</p>
        <Link className="mt-[0.75rem] inline-block font-medium underline" href="/dashboard/orders">
          Voltar à lista
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
        {error instanceof ApiClientError ? error.message : "Erro ao carregar o pedido."}
      </div>
    );
  }

  if (order && order.status !== "DRAFT") {
    return (
      <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <p className="text-[0.9375rem] text-zinc-600 dark:text-zinc-400">
          Só é possível editar o cabeçalho enquanto o pedido está em rascunho.
        </p>
        <Link
          className="mt-[0.75rem] inline-block font-medium underline"
          href={`/dashboard/orders/${order.id}`}
        >
          Voltar ao pedido
        </Link>
      </div>
    );
  }

  if (!order) {
    return <></>;
  }

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((payload) => update.mutate({ id, payload }))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <span className="text-[0.875rem] font-medium">Cliente (opcional no rascunho)</span>
        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400" htmlFor="order-edit-customer-search">
              Pesquisar cliente
            </label>
            <input
              id="order-edit-customer-search"
              type="search"
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
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
            onClick={applyCustomerSearch}
          >
            Aplicar
          </button>
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="order-edit-customer-id">
            Selecionar
          </label>
          <select
            id="order-edit-customer-id"
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("customerId")}
          >
            <option value="">Sem cliente</option>
            {customersData?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.document ? ` — ${c.document}` : ""}
              </option>
            ))}
          </select>
          {form.formState.errors.customerId ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.customerId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="order-edit-notes">
          Observações
        </label>
        <textarea
          id="order-edit-notes"
          rows={4}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.notes.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem] sm:max-w-[12rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="order-edit-discount">
          Desconto (R$)
        </label>
        <input
          id="order-edit-discount"
          type="number"
          step="any"
          min={0}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("discount", { valueAsNumber: true })}
        />
        {form.formState.errors.discount ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.discount.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={update.isPending}
        >
          {update.isPending ? "A guardar…" : "Guardar alterações"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href={`/dashboard/orders/${id}`}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
