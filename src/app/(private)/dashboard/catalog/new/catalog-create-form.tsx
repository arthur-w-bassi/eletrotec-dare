"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import {
  createCatalogItemSchema,
  type CreateCatalogItemPayload,
} from "@/domain/catalog/catalog-types";
import { useCreateCatalogItem } from "@/domain/catalog/useCases/use-create-catalog-item";
import { ApiClientError } from "@/domain/utils/api-utils";

import { CatalogFormFields } from "../catalog-form-fields";

const defaultValues: CreateCatalogItemPayload = {
  type: "PRODUCT",
  name: "",
  description: "",
  price: 0,
  costPrice: 0,
  stockQuantity: 0,
  unit: "UN",
  barcode: "",
  estimatedDurationMinutes: undefined,
};

export function CatalogCreateForm(): React.ReactElement {
  const router = useRouter();
  const form = useForm<CreateCatalogItemPayload>({
    resolver: zodResolver(createCatalogItemSchema) as Resolver<CreateCatalogItemPayload>,
    defaultValues,
  });

  const itemType = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    if (itemType === "SERVICE") {
      form.setValue("costPrice", undefined);
      form.setValue("stockQuantity", undefined);
      form.setValue("unit", undefined);
      form.setValue("barcode", undefined);
      form.clearErrors(["costPrice", "stockQuantity", "unit", "barcode"]);
    } else if (itemType === "PRODUCT") {
      form.setValue("estimatedDurationMinutes", undefined);
      form.clearErrors("estimatedDurationMinutes");
      if (form.getValues("costPrice") === undefined) form.setValue("costPrice", 0);
      if (form.getValues("stockQuantity") === undefined) form.setValue("stockQuantity", 0);
      if (form.getValues("unit") === undefined) form.setValue("unit", "UN");
    }
  }, [itemType, form]);

  const create = useCreateCatalogItem({
    onSuccess: (data) => {
      router.push(`/dashboard/catalog/${data.id}`);
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

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((data) => create.mutate(data))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <CatalogFormFields
        mode="create"
        control={form.control}
        register={form.register}
        errors={form.formState.errors}
      />

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={create.isPending}
        >
          {create.isPending ? "A guardar…" : "Criar item"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href="/dashboard/catalog"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
