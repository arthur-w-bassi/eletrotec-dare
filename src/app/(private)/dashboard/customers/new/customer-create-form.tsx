"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import {
  createCustomerSchema,
  isValidCnpj,
  normalizeDigits,
  type CreateCustomerPayload,
} from "@/domain/customer/customer-types";
import { useCnpjLookup } from "@/domain/customer/useCases/use-cnpj-lookup";
import { useCreateCustomer } from "@/domain/customer/useCases/use-create-customer";
import { ApiClientError } from "@/domain/utils/api-utils";
import { formatDtoDocumentForForm } from "@/helpers/customer-input-masks";

import { CustomerFormFields } from "../customer-form-fields";

const defaultValues: CreateCustomerPayload = {
  type: "PF",
  name: "",
  tradeName: "",
  document: "",
  email: "",
  phone: "",
  secondaryPhone: "",
  zipCode: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  number: "",
  complement: "",
  notes: "",
};

const DEBOUNCE_MS = 800;

function applyCnpjDataToForm(
  form: ReturnType<typeof useForm<CreateCustomerPayload>>,
  d: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement: string;
  },
): void {
  form.setValue("name", d.razaoSocial);
  form.setValue("tradeName", d.nomeFantasia);
  form.setValue("document", d.cnpj);
  form.setValue("zipCode", d.zipCode);
  form.setValue("state", d.state);
  form.setValue("city", d.city);
  form.setValue("neighborhood", d.neighborhood);
  form.setValue("street", d.street);
  form.setValue("number", d.number);
  form.setValue("complement", d.complement);
}

export function CustomerCreateForm(): React.ReactElement {
  const router = useRouter();
  const form = useForm<CreateCustomerPayload>({
    resolver: zodResolver(createCustomerSchema) as Resolver<CreateCustomerPayload>,
    defaultValues,
  });

  const docRaw = useWatch({ control: form.control, name: "document" });
  const personType = useWatch({ control: form.control, name: "type" });
  const docDigits = normalizeDigits(typeof docRaw === "string" ? docRaw : "");

  const [debouncedDocDigits, setDebouncedDocDigits] = useState("");

  useEffect(() => {
    if (personType !== "PJ") return;
    const t = window.setTimeout(() => {
      setDebouncedDocDigits(docDigits);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [docDigits, personType]);

  const lookupCnpjDigits = personType === "PJ" ? debouncedDocDigits : "";

  const cnpjLookupEnabled = personType === "PJ" && isValidCnpj(lookupCnpjDigits);

  const cnpjLookup = useCnpjLookup(lookupCnpjDigits, {
    enabled: cnpjLookupEnabled,
  });

  useEffect(() => {
    if (personType !== "PJ") {
      form.clearErrors("document");
    }
  }, [personType, form]);

  useEffect(() => {
    if (!cnpjLookup.isSuccess || !cnpjLookup.data) return;
    if (cnpjLookup.data.cnpj !== lookupCnpjDigits) return;
    applyCnpjDataToForm(form, cnpjLookup.data);
    form.clearErrors("document");
  }, [cnpjLookup.isSuccess, cnpjLookup.data, lookupCnpjDigits, form]);

  useEffect(() => {
    if (!cnpjLookupEnabled || !cnpjLookup.isError || !cnpjLookup.error) return;
    const err = cnpjLookup.error;
    let msg = "Erro ao consultar. Preencha manualmente.";
    if (err instanceof ApiClientError) {
      if (err.status === 404) msg = "CNPJ não encontrado";
      else msg = err.message;
    }
    form.setError("document", { type: "server", message: msg });
  }, [cnpjLookupEnabled, cnpjLookup.isError, cnpjLookup.error, form]);

  useEffect(() => {
    const raw = form.getValues("document");
    const d = normalizeDigits(typeof raw === "string" ? raw : "");
    if (personType === "PF" && d.length > 11) {
      form.setValue("document", formatDtoDocumentForForm("PF", d));
    } else if (personType === "PJ" && d.length > 14) {
      form.setValue("document", formatDtoDocumentForForm("PJ", d));
    }
  }, [personType, form]);

  const create = useCreateCustomer({
    onSuccess: (data) => {
      router.push(`/dashboard/customers/${data.id}`);
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  const addressFieldsDisabled = personType === "PJ" && cnpjLookup.isFetching;

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

      <CustomerFormFields
        control={form.control}
        register={form.register}
        errors={form.formState.errors}
        documentBusy={personType === "PJ" && cnpjLookup.isFetching}
        addressFieldsDisabled={addressFieldsDisabled}
      />

      <div className="flex flex-wrap gap-[0.75rem]">
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] px-[1.25rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={create.isPending}
        >
          {create.isPending ? "A guardar…" : "Criar cliente"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href="/dashboard/customers"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
