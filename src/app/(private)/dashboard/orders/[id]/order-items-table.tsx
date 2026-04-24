"use client";

import type { OrderItemDTO, OrderStatusValue } from "@/domain/order/order-types";
import { useRemoveOrderItem } from "@/domain/order/useCases/use-remove-order-item";
import { ApiClientError } from "@/domain/utils/api-utils";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatMoney(value: string): string {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return "—";
  return money.format(n);
}

function formatQty(value: string): string {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(n);
}

function typeLabel(t: OrderItemDTO["catalogItemType"]): string {
  return t === "PRODUCT" ? "Produto" : "Serviço";
}

export function OrderItemsTable({
  orderId,
  status,
  items,
}: {
  orderId: string;
  status: OrderStatusValue;
  items: OrderItemDTO[];
}): React.ReactElement {
  const isDraft = status === "DRAFT";

  const remove = useRemoveOrderItem();

  function handleRemove(itemId: string, name: string): void {
    const ok = window.confirm(`Remover "${name}" deste pedido?`);
    if (!ok) return;
    remove.mutate({ orderId, itemId });
  }

  return (
    <div className="flex flex-col gap-[0.5rem]">
      <h3 className="text-[1rem] font-semibold">Itens</h3>
      {remove.isError && remove.error instanceof ApiClientError ? (
        <p className="text-[0.875rem] text-red-600">{remove.error.message}</p>
      ) : null}
      <div className="overflow-x-auto rounded-[0.75rem] border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[36rem] border-collapse text-left text-[0.875rem]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Artigo</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Tipo</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Qtd.</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Preço unit.</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Total linha</th>
              {isDraft ? <th className="px-[0.75rem] py-[0.625rem] font-medium" /> : null}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-[0.75rem] py-[1rem] text-zinc-500" colSpan={isDraft ? 6 : 5}>
                  Nenhum item neste pedido.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
                >
                  <td className="px-[0.75rem] py-[0.625rem]">{row.catalogItemName}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{typeLabel(row.catalogItemType)}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{formatQty(row.quantity)}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{formatMoney(row.unitPrice)}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{formatMoney(row.itemTotal)}</td>
                  {isDraft ? (
                    <td className="px-[0.75rem] py-[0.625rem]">
                      <button
                        type="button"
                        className="text-[0.8125rem] font-medium text-red-700 underline disabled:opacity-50 dark:text-red-400"
                        disabled={remove.isPending}
                        onClick={() => handleRemove(row.id, row.catalogItemName)}
                      >
                        Remover
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
