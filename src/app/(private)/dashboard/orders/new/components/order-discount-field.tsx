"use client";

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export type OrderDiscountFieldsSlice = {
  discount?: number;
};

export interface OrderDiscountFieldProps<T extends FieldValues & OrderDiscountFieldsSlice> {
  form: UseFormReturn<T>;
  disabled?: boolean;
  fieldIdSuffix?: string;
}

export function OrderDiscountField<T extends FieldValues & OrderDiscountFieldsSlice>({
  form,
  disabled = false,
  fieldIdSuffix = "discount",
}: OrderDiscountFieldProps<T>): React.ReactElement {
  const sid = fieldIdSuffix.trim() === "" ? "default" : fieldIdSuffix.trim();

  const errs = form.formState.errors as Partial<
    Record<keyof OrderDiscountFieldsSlice, { message?: string } | undefined>
  >;

  return (
    <div className="flex flex-col gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <span className="text-[0.875rem] font-medium">Desconto (opcional)</span>
      <div className="flex flex-col gap-[0.25rem] sm:max-w-[16rem]">
        <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-discount`}>
          Valor (R$)
        </label>
        <input
          id={`order-${sid}-discount`}
          type="number"
          step="any"
          min={0}
          disabled={disabled}
          className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
          {...form.register("discount" as FieldPath<T>, {
            setValueAs: (v) => {
              if (v === "" || v === undefined) return undefined;
              const n = Number(v);
              return Number.isFinite(n) ? n : undefined;
            },
          })}
        />
        {errs.discount ? (
          <p className="text-[0.8125rem] text-red-600">{errs.discount.message}</p>
        ) : null}
      </div>
    </div>
  );
}
