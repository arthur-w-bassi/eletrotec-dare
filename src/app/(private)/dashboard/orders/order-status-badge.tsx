"use client";

import type { OrderStatusValue } from "@/domain/order/order-types";
import { cn } from "@/helpers/cn";

const LABELS: Record<OrderStatusValue, string> = {
  DRAFT: "Rascunho",
  CONFIRMED: "Confirmado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

const STYLES: Record<OrderStatusValue, string> = {
  DRAFT: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  CONFIRMED: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  CANCELLED: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatusValue }): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-[0.5rem] py-[0.125rem] text-[0.75rem] font-medium",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
