"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller, useWatch, type Control } from "react-hook-form";

import type { CreateCustomerPayload } from "@/domain/customer/customer-types";
import { cn } from "@/helpers/cn";
import {
  formatCepDisplay,
  formatDocumentDisplay,
  formatPhoneDisplay,
  normalizeCepInput,
  normalizeDocumentInput,
  normalizePhoneInput,
} from "@/helpers/customer-input-masks";

const inputClass = (hasError: boolean, extra?: string): string =>
  cn(
    "w-full rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
    hasError && "border-red-500",
    extra,
  );

interface CustomerFormFieldsProps {
  control: Control<CreateCustomerPayload>;
  register: UseFormRegister<CreateCustomerPayload>;
  errors: FieldErrors<CreateCustomerPayload>;
  disabled?: boolean;
  documentBusy?: boolean;
  addressFieldsDisabled?: boolean;
}

export function CustomerFormFields({
  control,
  register,
  errors,
  disabled = false,
  documentBusy = false,
  addressFieldsDisabled = false,
}: CustomerFormFieldsProps): React.ReactElement {
  const personType = useWatch({ control, name: "type" });
  const addrOff = disabled || addressFieldsDisabled;

  const documentLabel = personType === "PJ" ? "CNPJ" : "CPF";

  return (
    <div className="flex flex-col gap-[0.875rem]">
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-type">
          Tipo
        </label>
        <select
          id="customer-type"
          disabled={disabled}
          className={inputClass(Boolean(errors.type))}
          {...register("type")}
        >
          <option value="PF">Pessoa física</option>
          <option value="PJ">Pessoa jurídica</option>
        </select>
        {errors.type ? (
          <p className="text-[0.8125rem] text-red-600">{errors.type.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-name">
          Nome / razão social
        </label>
        <input
          id="customer-name"
          type="text"
          disabled={disabled}
          autoComplete="organization"
          className={inputClass(Boolean(errors.name))}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-[0.8125rem] text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      {personType === "PJ" ? (
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-trade-name">
            Nome fantasia
          </label>
          <input
            id="customer-trade-name"
            type="text"
            disabled={disabled}
            className={inputClass(Boolean(errors.tradeName))}
            {...register("tradeName")}
          />
          {errors.tradeName ? (
            <p className="text-[0.8125rem] text-red-600">{errors.tradeName.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-[0.25rem]">
        <div className="flex flex-wrap items-center gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-document">
            {documentLabel}
          </label>
          {documentBusy ? (
            <span className="text-[0.8125rem] text-zinc-500" aria-live="polite">
              A consultar…
            </span>
          ) : null}
        </div>
        <Controller
          name="document"
          control={control}
          render={({ field }) => {
            const digits = typeof field.value === "string" ? field.value : "";
            const display = formatDocumentDisplay(digits, personType);
            return (
              <input
                id="customer-document"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={disabled}
                aria-busy={documentBusy}
                className={inputClass(Boolean(errors.document), documentBusy ? "opacity-80" : undefined)}
                value={display}
                onChange={(e) => field.onChange(normalizeDocumentInput(e.target.value, personType))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            );
          }}
        />
        {errors.document ? (
          <p className="text-[0.8125rem] text-red-600">{errors.document.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-email">
          Email
        </label>
        <input
          id="customer-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          className={inputClass(Boolean(errors.email))}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-[0.8125rem] text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-[0.875rem] sm:grid-cols-2">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-phone">
            Telefone
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => {
              const digits = typeof field.value === "string" ? field.value : "";
              return (
                <input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  disabled={disabled}
                  className={inputClass(Boolean(errors.phone))}
                  value={formatPhoneDisplay(digits)}
                  onChange={(e) => field.onChange(normalizePhoneInput(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              );
            }}
          />
          {errors.phone ? (
            <p className="text-[0.8125rem] text-red-600">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-secondary-phone">
            Telefone secundário
          </label>
          <Controller
            name="secondaryPhone"
            control={control}
            render={({ field }) => {
              const digits = typeof field.value === "string" ? field.value : "";
              return (
                <input
                  id="customer-secondary-phone"
                  type="tel"
                  inputMode="tel"
                  disabled={disabled}
                  className={inputClass(Boolean(errors.secondaryPhone))}
                  value={formatPhoneDisplay(digits)}
                  onChange={(e) => field.onChange(normalizePhoneInput(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              );
            }}
          />
          {errors.secondaryPhone ? (
            <p className="text-[0.8125rem] text-red-600">{errors.secondaryPhone.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-[0.875rem] sm:grid-cols-2">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-zip">
            CEP
          </label>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => {
              const digits = typeof field.value === "string" ? field.value : "";
              return (
                <input
                  id="customer-zip"
                  type="text"
                  inputMode="numeric"
                  disabled={addrOff}
                  className={inputClass(Boolean(errors.zipCode))}
                  value={formatCepDisplay(digits)}
                  onChange={(e) => field.onChange(normalizeCepInput(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              );
            }}
          />
          {errors.zipCode ? (
            <p className="text-[0.8125rem] text-red-600">{errors.zipCode.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-state">
            UF
          </label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <input
                id="customer-state"
                type="text"
                maxLength={2}
                disabled={addrOff}
                className={inputClass(Boolean(errors.state))}
                value={typeof field.value === "string" ? field.value : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .slice(0, 2),
                  )
                }
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          {errors.state ? (
            <p className="text-[0.8125rem] text-red-600">{errors.state.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-city">
          Cidade
        </label>
        <input
          id="customer-city"
          type="text"
          disabled={addrOff}
          className={inputClass(Boolean(errors.city))}
          {...register("city")}
        />
        {errors.city ? (
          <p className="text-[0.8125rem] text-red-600">{errors.city.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-neighborhood">
          Bairro
        </label>
        <input
          id="customer-neighborhood"
          type="text"
          disabled={addrOff}
          className={inputClass(Boolean(errors.neighborhood))}
          {...register("neighborhood")}
        />
        {errors.neighborhood ? (
          <p className="text-[0.8125rem] text-red-600">{errors.neighborhood.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-street">
          Logradouro
        </label>
        <input
          id="customer-street"
          type="text"
          disabled={addrOff}
          className={inputClass(Boolean(errors.street))}
          {...register("street")}
        />
        {errors.street ? (
          <p className="text-[0.8125rem] text-red-600">{errors.street.message}</p>
        ) : null}
      </div>

      <div className="grid gap-[0.875rem] sm:grid-cols-2">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-number">
            Número
          </label>
          <input
            id="customer-number"
            type="text"
            disabled={addrOff}
            className={inputClass(Boolean(errors.number))}
            {...register("number")}
          />
          {errors.number ? (
            <p className="text-[0.8125rem] text-red-600">{errors.number.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="customer-complement">
            Complemento
          </label>
          <input
            id="customer-complement"
            type="text"
            disabled={addrOff}
            className={inputClass(Boolean(errors.complement))}
            {...register("complement")}
          />
          {errors.complement ? (
            <p className="text-[0.8125rem] text-red-600">{errors.complement.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="customer-notes">
          Notas
        </label>
        <textarea
          id="customer-notes"
          rows={3}
          disabled={disabled}
          className={inputClass(Boolean(errors.notes))}
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="text-[0.8125rem] text-red-600">{errors.notes.message}</p>
        ) : null}
      </div>
    </div>
  );
}
