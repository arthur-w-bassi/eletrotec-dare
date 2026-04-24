"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import type { CustomerDTO } from "@/domain/customer/customer-types";
import {
  isValidCnpj,
  normalizeDigits,
  updateCustomerSchema,
  type CreateCustomerPayload,
  type UpdateCustomerPayload,
} from "@/domain/customer/customer-types";
import { useCnpjLookup } from "@/domain/customer/useCases/use-cnpj-lookup";
import { useCustomer } from "@/domain/customer/useCases/use-customer";
import { useUpdateCustomer } from "@/domain/customer/useCases/use-update-customer";
import { ApiClientError } from "@/domain/utils/api-utils";
import { formatDtoDocumentForForm } from "@/helpers/customer-input-masks";

import { CustomerFormFields } from "../../customer-form-fields";

const DEBOUNCE_MS = 800;

function dtoToFormValues(dto: CustomerDTO): CreateCustomerPayload {
  return {
    type: dto.type,
    name: dto.name,
    tradeName: dto.tradeName ?? "",
    document: formatDtoDocumentForForm(dto.type, dto.document),
    email: dto.email ?? "",
    phone: normalizeDigits(dto.phone ?? ""),
    secondaryPhone: normalizeDigits(dto.secondaryPhone ?? ""),
    zipCode: normalizeDigits(dto.zipCode ?? ""),
    state: dto.state ?? "",
    city: dto.city ?? "",
    neighborhood: dto.neighborhood ?? "",
    street: dto.street ?? "",
    number: dto.number ?? "",
    complement: dto.complement ?? "",
    notes: dto.notes ?? "",
  };
}

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

interface CustomerEditFormProps {
  id: string;
}

export function CustomerEditForm({ id }: CustomerEditFormProps): React.ReactElement {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCustomer(id);
  const [documentDirty, setDocumentDirty] = useState(false);
  const syncedDocumentDigitsRef = useRef<string | null>(null);

  const form = useForm<CreateCustomerPayload>({
    resolver: zodResolver(updateCustomerSchema) as Resolver<CreateCustomerPayload>,
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(dtoToFormValues(data));
      syncedDocumentDigitsRef.current = normalizeDigits(data.document ?? "");
      queueMicrotask(() => {
        setDocumentDirty(false);
      });
    } else {
      syncedDocumentDigitsRef.current = null;
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps -- reset apenas quando o DTO muda

  const docRaw = useWatch({ control: form.control, name: "document" });
  const personType = useWatch({ control: form.control, name: "type" });
  const docDigits = normalizeDigits(typeof docRaw === "string" ? docRaw : "");

  useEffect(() => {
    const synced = syncedDocumentDigitsRef.current;
    if (synced === null) return;
    setDocumentDirty(docDigits !== synced);
  }, [docDigits]);

  const [debouncedDocDigits, setDebouncedDocDigits] = useState("");

  useEffect(() => {
    if (personType !== "PJ") return;
    const t = window.setTimeout(() => {
      setDebouncedDocDigits(docDigits);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [docDigits, personType]);

  const lookupCnpjDigits = personType === "PJ" ? debouncedDocDigits : "";

  const cnpjLookupEnabled =
    personType === "PJ" && isValidCnpj(lookupCnpjDigits) && documentDirty;

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

  const update = useUpdateCustomer({
    onSuccess: () => {
      router.push(`/dashboard/customers/${id}`);
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
        <p className="text-[0.9375rem]">Cliente não encontrado.</p>
        <Link className="mt-[0.75rem] inline-block font-medium underline" href="/dashboard/customers">
          Voltar à lista
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[0.875rem] text-red-600">
        {error instanceof ApiClientError ? error.message : "Erro ao carregar o cliente."}
      </p>
    );
  }

  if (!data) {
    return <></>;
  }

  const addressFieldsDisabled = personType === "PJ" && cnpjLookup.isFetching;

  return (
    <form
      className="flex max-w-[40rem] flex-col gap-[1rem]"
      onSubmit={form.handleSubmit((payload) =>
        update.mutate({ id, payload: payload as UpdateCustomerPayload }),
      )}
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
          disabled={update.isPending}
        >
          {update.isPending ? "A guardar…" : "Guardar alterações"}
        </button>
        <Link
          className="inline-flex items-center rounded-full border border-zinc-300 px-[1.25rem] py-[0.625rem] text-[0.9375rem] font-medium dark:border-zinc-600"
          href={`/dashboard/customers/${id}`}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
