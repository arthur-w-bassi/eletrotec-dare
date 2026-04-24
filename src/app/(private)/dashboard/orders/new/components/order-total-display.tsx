"use client";

import { useMemo } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { OrderDiscountFieldsSlice } from "./order-discount-field";
import type { OrderPricingFieldsSlice } from "./order-value-fields";

function safeNum(v: unknown): number {
  if (v === undefined || v === null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatBrl(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export type OrderTotalDisplayFieldsSlice = OrderPricingFieldsSlice & OrderDiscountFieldsSlice;

export interface OrderTotalDisplayProps<T extends FieldValues & OrderTotalDisplayFieldsSlice> {
  form: UseFormReturn<T>;
}

export function OrderTotalDisplay<T extends FieldValues & OrderTotalDisplayFieldsSlice>({
  form,
}: OrderTotalDisplayProps<T>): React.ReactElement {
  const baseValue = useWatch({ control: form.control, name: "baseValue" as FieldPath<T> });
  const taxPercent = useWatch({ control: form.control, name: "taxPercent" as FieldPath<T> });
  const servicePercent = useWatch({ control: form.control, name: "servicePercent" as FieldPath<T> });
  const productPercent = useWatch({ control: form.control, name: "productPercent" as FieldPath<T> });
  const discount = useWatch({ control: form.control, name: "discount" as FieldPath<T> });

  const total = useMemo(() => {
    const base = safeNum(baseValue);
    const taxAmount = base * (safeNum(taxPercent) / 100);
    const serviceAmount = base * (safeNum(servicePercent) / 100);
    const productAmount = base * (safeNum(productPercent) / 100);
    const subtotal = base + taxAmount + serviceAmount + productAmount;
    const disc = safeNum(discount);
    const raw = subtotal - disc;
    return raw > 0 ? raw : 0;
  }, [baseValue, taxPercent, servicePercent, productPercent, discount]);

  return (
    <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <p className="text-[0.875rem] text-zinc-600 dark:text-zinc-400">Total</p>
      <p className="text-[1.25rem] font-semibold tabular-nums">{formatBrl(total)}</p>
      <p className="mt-[0.5rem] text-[0.75rem] text-zinc-500">
        Pré-visualização local; o valor definitivo é calculado no servidor ao criar o pedido.
      </p>
    </div>
  );
}
