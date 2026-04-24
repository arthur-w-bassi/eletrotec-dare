"use client";

import Link from "next/link";

import { useCancelOrder } from "@/domain/order/useCases/use-cancel-order";
import { useCompleteOrder } from "@/domain/order/useCases/use-complete-order";
import { useConfirmOrder } from "@/domain/order/useCases/use-confirm-order";
import { useOrder } from "@/domain/order/useCases/use-order";
import { ApiClientError } from "@/domain/utils/api-utils";

import { OrderItemAddForm } from "./order-item-add-form";
import { OrderItemsTable } from "./order-items-table";
import { OrderStatusBadge } from "../order-status-badge";
import { OrderTotalsSummary } from "./order-totals-summary";

function formatOrderNumber(n: number): string {
  return `#${String(n).padStart(4, "0")}`;
}

function formatValue(value: string | null): string {
  return value === null || value === "" ? "—" : value;
}

function DetailRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-[0.125rem] text-[1rem] whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function formatTs(iso: string | null): string {
  if (iso === null) return "—";
  return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

interface OrderDetailPageProps {
  id: string;
}

export function OrderDetailPage({ id }: OrderDetailPageProps): React.ReactElement {
  const { data, isLoading, isError, error } = useOrder(id);

  const confirm = useConfirmOrder();
  const complete = useCompleteOrder();
  const cancel = useCancelOrder();

  const notFound =
    isError &&
    error instanceof ApiClientError &&
    (error.status === 404 || error.code === "NOT_FOUND" || error.code === "VALIDATION_ERROR");

  function mutationMessage(err: unknown): string {
    return err instanceof ApiClientError ? err.message : "Erro inesperado.";
  }

  function handleConfirm(): void {
    if (!data) return;
    confirm.mutate(data.id);
  }

  function handleComplete(): void {
    if (!data) return;
    complete.mutate(data.id);
  }

  function handleCancel(): void {
    if (!data) return;
    const ok = window.confirm("Cancelar este pedido? Esta ação não pode ser anulada.");
    if (!ok) return;
    cancel.mutate(data.id);
  }

  const actionPending = confirm.isPending || complete.isPending || cancel.isPending;

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/orders"
        >
          Voltar à lista
        </Link>
        {data?.status === "DRAFT" ? (
          <Link
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium dark:border-zinc-600"
            href={`/dashboard/orders/${data.id}/edit`}
          >
            Editar
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-[0.9375rem] text-zinc-500">A carregar…</p>
      ) : notFound ? (
        <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
          <p className="text-[0.9375rem]">Pedido não encontrado.</p>
          <Link className="mt-[0.75rem] inline-block font-medium underline" href="/dashboard/orders">
            Voltar à lista
          </Link>
        </div>
      ) : isError ? (
        <div className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {error instanceof ApiClientError ? error.message : "Erro ao carregar o pedido."}
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center gap-[0.75rem]">
            <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">
              Pedido {formatOrderNumber(data.orderNumber)}
            </h2>
            <OrderStatusBadge status={data.status} />
          </div>

          <dl className="grid gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
            <DetailRow label="Cliente" value={formatValue(data.customerName)} />
            <DetailRow label="Observações" value={formatValue(data.notes)} />
            <DetailRow label="Confirmado em" value={formatTs(data.confirmedAt)} />
            <DetailRow label="Finalizado em" value={formatTs(data.completedAt)} />
            <DetailRow label="Cancelado em" value={formatTs(data.cancelledAt)} />
            <DetailRow
              label="Criado em"
              value={new Date(data.createdAt).toLocaleString("pt-PT", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            />
            <DetailRow
              label="Atualizado em"
              value={new Date(data.updatedAt).toLocaleString("pt-PT", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            />
          </dl>

          <OrderTotalsSummary subtotal={data.subtotal} discount={data.discount} total={data.total} />

          <OrderItemsTable orderId={data.id} status={data.status} items={data.items} />

          {data.status === "DRAFT" ? <OrderItemAddForm orderId={data.id} /> : null}

          {data.status === "DRAFT" || data.status === "CONFIRMED" ? (
            <div className="flex flex-col gap-[0.5rem]">
              <div className="flex flex-wrap gap-[0.5rem]">
                {data.status === "DRAFT" ? (
                  <button
                    type="button"
                    className="rounded-full bg-foreground px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-background disabled:opacity-50"
                    disabled={actionPending}
                    onClick={handleConfirm}
                  >
                    {confirm.isPending ? "A confirmar…" : "Confirmar pedido"}
                  </button>
                ) : null}
                {data.status === "CONFIRMED" ? (
                  <button
                    type="button"
                    className="rounded-full bg-foreground px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-background disabled:opacity-50"
                    disabled={actionPending}
                    onClick={handleComplete}
                  >
                    {complete.isPending ? "A finalizar…" : "Finalizar pedido"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-full border border-red-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-red-800 disabled:opacity-50 dark:border-red-900 dark:text-red-200"
                  disabled={actionPending}
                  onClick={handleCancel}
                >
                  {cancel.isPending ? "A cancelar…" : "Cancelar pedido"}
                </button>
              </div>
              {confirm.isError ? (
                <p className="text-[0.875rem] text-red-600">{mutationMessage(confirm.error)}</p>
              ) : null}
              {complete.isError ? (
                <p className="text-[0.875rem] text-red-600">{mutationMessage(complete.error)}</p>
              ) : null}
              {cancel.isError ? (
                <p className="text-[0.875rem] text-red-600">{mutationMessage(cancel.error)}</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
