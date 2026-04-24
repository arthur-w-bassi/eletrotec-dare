"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useWatch, type Control } from "react-hook-form";

import type { CreateCatalogItemPayload } from "@/domain/catalog/catalog-types";
import { cn } from "@/helpers/cn";

const UNIT_OPTIONS = [
  { value: "UN", label: "UN — unidade" },
  { value: "KG", label: "KG" },
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "M2", label: "M²" },
  { value: "M3", label: "M³" },
  { value: "CX", label: "CX — caixa" },
  { value: "PCT", label: "PCT — pacote" },
  { value: "HR", label: "HR — hora" },
] as const;

const inputClass = (hasError: boolean, extra?: string): string =>
  cn(
    "w-full rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
    hasError && "border-red-500",
    extra,
  );

export interface CatalogFormFieldsProps {
  mode: "create" | "edit";
  control: Control<CreateCatalogItemPayload>;
  register: UseFormRegister<CreateCatalogItemPayload>;
  errors: FieldErrors<CreateCatalogItemPayload>;
  disabled?: boolean;
  /** Em modo edit, tipo fixo vindo do servidor (sem select). */
  fixedType?: "PRODUCT" | "SERVICE";
}

export function CatalogFormFields({
  mode,
  control,
  register,
  errors,
  disabled = false,
  fixedType,
}: CatalogFormFieldsProps): React.ReactElement {
  const watchedType = useWatch({ control, name: "type" });
  const itemType = mode === "edit" ? (fixedType ?? watchedType) : watchedType;

  return (
    <div className="flex flex-col gap-[0.875rem]">
      {mode === "edit" ? <input type="hidden" {...register("type")} /> : null}

      <div className="flex flex-col gap-[0.25rem]">
        <span className="text-[0.875rem] font-medium">Tipo</span>
        {mode === "create" ? (
          <>
            <select
              id="catalog-type"
              disabled={disabled}
              className={inputClass(Boolean(errors.type))}
              {...register("type")}
            >
              <option value="PRODUCT">Produto</option>
              <option value="SERVICE">Serviço</option>
            </select>
            {errors.type ? (
              <p className="text-[0.8125rem] text-red-600">{errors.type.message}</p>
            ) : null}
          </>
        ) : (
          <p
            id="catalog-type-readonly"
            className="rounded-[0.5rem] border border-zinc-200 bg-zinc-50 px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            {fixedType === "PRODUCT" ? "Produto" : "Serviço"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="catalog-name">
          Nome
        </label>
        <input
          id="catalog-name"
          type="text"
          disabled={disabled}
          autoComplete="off"
          className={inputClass(Boolean(errors.name))}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-[0.8125rem] text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="catalog-description">
          Descrição (opcional)
        </label>
        <textarea
          id="catalog-description"
          rows={3}
          disabled={disabled}
          className={inputClass(Boolean(errors.description))}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-[0.8125rem] text-red-600">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="catalog-price">
          Preço de venda
        </label>
        <input
          id="catalog-price"
          type="text"
          inputMode="decimal"
          disabled={disabled}
          className={inputClass(Boolean(errors.price))}
          {...register("price")}
        />
        {errors.price ? (
          <p className="text-[0.8125rem] text-red-600">{errors.price.message}</p>
        ) : null}
      </div>

      {itemType === "PRODUCT" ? (
        <>
          <div className="flex flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="catalog-cost">
              Custo
            </label>
            <input
              id="catalog-cost"
              type="text"
              inputMode="decimal"
              disabled={disabled}
              className={inputClass(Boolean(errors.costPrice))}
              {...register("costPrice")}
            />
            {errors.costPrice ? (
              <p className="text-[0.8125rem] text-red-600">{errors.costPrice.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="catalog-stock">
              Estoque
            </label>
            <input
              id="catalog-stock"
              type="text"
              inputMode="decimal"
              disabled={disabled}
              className={inputClass(Boolean(errors.stockQuantity))}
              {...register("stockQuantity")}
            />
            {errors.stockQuantity ? (
              <p className="text-[0.8125rem] text-red-600">{errors.stockQuantity.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="catalog-unit">
              Unidade
            </label>
            <select
              id="catalog-unit"
              disabled={disabled}
              className={inputClass(Boolean(errors.unit))}
              {...register("unit")}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.unit ? (
              <p className="text-[0.8125rem] text-red-600">{errors.unit.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="catalog-barcode">
              Código de barras (opcional)
            </label>
            <input
              id="catalog-barcode"
              type="text"
              disabled={disabled}
              autoComplete="off"
              className={inputClass(Boolean(errors.barcode))}
              {...register("barcode")}
            />
            {errors.barcode ? (
              <p className="text-[0.8125rem] text-red-600">{errors.barcode.message}</p>
            ) : null}
          </div>
        </>
      ) : null}

      {itemType === "SERVICE" ? (
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="catalog-duration">
            Duração estimada (minutos, opcional)
          </label>
          <input
            id="catalog-duration"
            type="number"
            min={1}
            step={1}
            disabled={disabled}
            className={inputClass(Boolean(errors.estimatedDurationMinutes))}
            {...register("estimatedDurationMinutes", {
              setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)),
            })}
          />
          {errors.estimatedDurationMinutes ? (
            <p className="text-[0.8125rem] text-red-600">
              {errors.estimatedDurationMinutes.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
