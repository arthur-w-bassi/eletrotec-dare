"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  updateCatalogItemSchema,
  type CatalogItemDTO,
  type CreateCatalogItemPayload,
} from "@/domain/catalog/catalog-types";
import { useCatalogItem } from "@/domain/catalog/useCases/use-catalog-item";
import { useUpdateCatalogItem } from "@/domain/catalog/useCases/use-update-catalog-item";
import { ApiClientError } from "@/domain/utils/api-utils";

import { CatalogFormFields } from "../../catalog-form-fields";

function dtoToFormValues(dto: CatalogItemDTO): CreateCatalogItemPayload {
  const base = {
    name: dto.name,
    description: dto.description ?? "",
    price: Number.parseFloat(dto.price),
  };

  if (dto.type === "PRODUCT") {
    return {
      type: "PRODUCT",
      ...base,
      costPrice: dto.costPrice !== null ? Number.parseFloat(dto.costPrice) : 0,
      stockQuantity: dto.stockQuantity !== null ? Number.parseFloat(dto.stockQuantity) : 0,
      unit: (dto.unit as CreateCatalogItemPayload["unit"]) ?? "UN",
      barcode: dto.barcode ?? "",
      estimatedDurationMinutes: undefined,
    };
  }

  return {
    type: "SERVICE",
    ...base,
    costPrice: undefined,
    stockQuantity: undefined,
    unit: undefined,
    barcode: undefined,
    estimatedDurationMinutes: dto.estimatedDurationMinutes ?? undefined,
  };
}

interface CatalogEditFormProps {
  id: string;
}

export function CatalogEditForm({ id }: CatalogEditFormProps): React.ReactElement {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCatalogItem(id);

  const form = useForm<CreateCatalogItemPayload>({
    resolver: zodResolver(updateCatalogItemSchema) as unknown as Resolver<CreateCatalogItemPayload>,
    defaultValues: {
      type: "PRODUCT",
      name: "",
      description: "",
      price: 0,
      costPrice: 0,
      stockQuantity: 0,
      unit: "UN",
      barcode: "",
      estimatedDurationMinutes: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(dtoToFormValues(data));
    }
  }, [data, form]);

  const update = useUpdateCatalogItem({
    onSuccess: () => {
      router.push(`/dashboard/catalog/${id}`);
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        if (err.code === "DUPLICATE_BARCODE") {
          form.setError("barcode", { type: "server", message: err.message });
          return;
        }
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  const notFound =
    isError &&
    error instanceof ApiClientError &&
    (error.status === 404 || error.code === "NOT_FOUND" || error.code === "VALIDATION_ERROR");

  if (isLoading) {
    return <p className="text-[0.9375rem] text-zinc-500">A carregar…</p>;
  }

  if (notFound) {
    return (
      <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <p className="text-[0.9375rem]">Item não encontrado.</p>
        <Link className="mt-[0.75rem] inline-block font-medium underline" href="/dashboard/catalog">
          Voltar à lista
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[0.875rem] text-red-600">
        {error instanceof ApiClientError ? error.message : "Erro ao carregar o item."}
      </p>
    );
  }

  if (!data) {
    return <></>;
  }

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((values) => {
        // `type` is imutável no servidor; o body de atualização não inclui este campo.
        const { type: _catalogItemType, ...payload } = values;
        void _catalogItemType;
        update.mutate({ id, payload });
      })}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <CatalogFormFields
        mode="edit"
        fixedType={data.type}
        control={form.control}
        register={form.register}
        errors={form.formState.errors}
      />

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={update.isPending}
        >
          {update.isPending ? "A guardar…" : "Guardar alterações"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href={`/dashboard/catalog/${id}`}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
