"use client";

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import type { PaymentStatusValue } from "@/domain/order/order-api";

export type OrderPaymentFieldsSlice = {
  paymentConditionId?: string;
  paymentStatus?: PaymentStatusValue;
};

export interface PaymentConditionOption {
  id: string;
  name: string;
}

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusValue; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "PARTIAL", label: "Parcial" },
  { value: "PAID", label: "Pago" },
];

export interface OrderPaymentFieldsProps<T extends FieldValues & OrderPaymentFieldsSlice> {
  form: UseFormReturn<T>;
  conditions: PaymentConditionOption[];
  disabled?: boolean;
  fieldIdSuffix?: string;
}

export function OrderPaymentFields<T extends FieldValues & OrderPaymentFieldsSlice>({
  form,
  conditions,
  disabled = false,
  fieldIdSuffix = "payment",
}: OrderPaymentFieldsProps<T>): React.ReactElement {
  const sid = fieldIdSuffix.trim() === "" ? "default" : fieldIdSuffix.trim();

  const errs = form.formState.errors as Partial<
    Record<keyof OrderPaymentFieldsSlice, { message?: string } | undefined>
  >;

  return (
    <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <span className="text-[0.875rem] font-medium">Condição de pagamento (opcional)</span>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-payment-condition`}>
          Condição
        </label>
        <select
          id={`order-${sid}-payment-condition`}
          disabled={disabled}
          className="rounded-[0.5rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600 dark:bg-zinc-950"
          {...form.register("paymentConditionId" as FieldPath<T>)}
        >
          <option value="">Sem condição</option>
          {conditions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errs.paymentConditionId ? (
          <p className="text-[0.8125rem] text-red-600">{errs.paymentConditionId.message}</p>
        ) : null}
        {conditions.length === 0 ? (
          <p className="text-[0.8125rem] text-zinc-500">
            Nenhuma condição disponível. Podes continuar sem selecionar ou configurar condições no
            sistema.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem] sm:max-w-[16rem]">
        <label className="text-[0.875rem] font-medium" htmlFor={`order-${sid}-payment-status`}>
          Estado do pagamento
        </label>
        <select
          id={`order-${sid}-payment-status`}
          disabled={disabled}
          className="rounded-[0.5rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600 dark:bg-zinc-950"
          {...form.register("paymentStatus" as FieldPath<T>)}
        >
          <option value="">(padrão do servidor)</option>
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errs.paymentStatus ? (
          <p className="text-[0.8125rem] text-red-600">{errs.paymentStatus.message}</p>
        ) : null}
      </div>
    </div>
  );
}
