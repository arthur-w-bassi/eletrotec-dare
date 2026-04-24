"use client";

import { useMemo } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

/** Campos numéricos compartilhados pelos formulários SERVICE/PRODUCT (SPEC). */
export type OrderPricingFieldsSlice = {
  baseValue?: number;
  taxPercent?: number;
  servicePercent?: number;
  productPercent?: number;
};

function safeNum(v: unknown): number {
  if (v === undefined || v === null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatBrl(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export interface OrderValueFieldsProps<T extends FieldValues & OrderPricingFieldsSlice> {
  form: UseFormReturn<T>;
  disabled?: boolean;
  fieldIdSuffix?: string;
}

export function OrderValueFields<T extends FieldValues & OrderPricingFieldsSlice>({
  form,
  disabled = false,
  fieldIdSuffix = "pricing",
}: OrderValueFieldsProps<T>): React.ReactElement {
  const sid = fieldIdSuffix.trim() === "" ? "default" : fieldIdSuffix.trim();

  const baseValue = useWatch({ control: form.control, name: "baseValue" as FieldPath<T> });
  const taxPercent = useWatch({ control: form.control, name: "taxPercent" as FieldPath<T> });
  const servicePercent = useWatch({ control: form.control, name: "servicePercent" as FieldPath<T> });
  const productPercent = useWatch({ control: form.control, name: "productPercent" as FieldPath<T> });

  const subtotal = useMemo(() => {
    const base = safeNum(baseValue);
    const taxAmount = base * (safeNum(taxPercent) / 100);
    const serviceAmount = base * (safeNum(servicePercent) / 100);
    const productAmount = base * (safeNum(productPercent) / 100);
    return base + taxAmount + serviceAmount + productAmount;
  }, [baseValue, taxPercent, servicePercent, productPercent]);

  const errs = form.formState.errors as Partial<
    Record<keyof OrderPricingFieldsSlice, { message?: string } | undefined>
  >;

  return (
    <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <span className="text-[0.875rem] font-medium">Valor</span>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-base-value`}>
          Valor base (R$)
        </label>
        <input
          id={`order-${sid}-base-value`}
          type="number"
          step="any"
          min={0}
          disabled={disabled}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("baseValue" as FieldPath<T>, {
            setValueAs: (v) => {
              if (v === "" || v === undefined) return undefined;
              const n = Number(v);
              return Number.isFinite(n) ? n : undefined;
            },
          })}
        />
        {errs.baseValue ? (
          <p className="text-[0.8125rem] text-red-600">{errs.baseValue.message}</p>
        ) : null}
      </div>

      <div className="grid gap-[0.75rem] sm:grid-cols-3">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-tax-pct`}>
            % Imposto
          </label>
          <input
            id={`order-${sid}-tax-pct`}
            type="number"
            step="any"
            min={0}
            disabled={disabled}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("taxPercent" as FieldPath<T>, {
              setValueAs: (v) => {
                if (v === "" || v === undefined) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          {errs.taxPercent ? (
            <p className="text-[0.8125rem] text-red-600">{errs.taxPercent.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-service-pct`}>
            % Serviço
          </label>
          <input
            id={`order-${sid}-service-pct`}
            type="number"
            step="any"
            min={0}
            disabled={disabled}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("servicePercent" as FieldPath<T>, {
              setValueAs: (v) => {
                if (v === "" || v === undefined) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          {errs.servicePercent ? (
            <p className="text-[0.8125rem] text-red-600">{errs.servicePercent.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-product-pct`}>
            % Produto
          </label>
          <input
            id={`order-${sid}-product-pct`}
            type="number"
            step="any"
            min={0}
            disabled={disabled}
            className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            {...form.register("productPercent" as FieldPath<T>, {
              setValueAs: (v) => {
                if (v === "" || v === undefined) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          {errs.productPercent ? (
            <p className="text-[0.8125rem] text-red-600">{errs.productPercent.message}</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-[0.75rem] dark:border-zinc-800">
        <p className="text-[0.875rem] text-zinc-600 dark:text-zinc-400">Subtotal (pré-visualização)</p>
        <p className="text-[1.125rem] font-semibold tabular-nums">{formatBrl(subtotal)}</p>
      </div>
    </div>
  );
}
