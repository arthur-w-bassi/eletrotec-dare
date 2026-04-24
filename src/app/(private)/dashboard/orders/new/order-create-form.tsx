"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  createOrderSchema,
  type CreateOrderPayload,
} from "@/domain/order/order-types";
import { useCreateOrder } from "@/domain/order/useCases/use-create-order";
import { ApiClientError } from "@/domain/utils/api-utils";

import { OrderCustomerFields } from "./components/order-customer-fields";

const defaultValues: CreateOrderPayload = {
  customerId: undefined,
  notes: "",
};

export function OrderCreateForm(): React.ReactElement {
  const router = useRouter();

  const form = useForm<CreateOrderPayload>({
    resolver: zodResolver(createOrderSchema) as Resolver<CreateOrderPayload>,
    defaultValues,
  });

  const create = useCreateOrder({
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

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((data) => create.mutate(data))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <OrderCustomerFields form={form} fieldIdSuffix="new" disabled={create.isPending} />

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="order-notes">
          Observações
        </label>
        <textarea
          id="order-notes"
          rows={4}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.notes.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={create.isPending}
        >
          {create.isPending ? "A criar…" : "Criar pedido"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href="/dashboard/orders"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
