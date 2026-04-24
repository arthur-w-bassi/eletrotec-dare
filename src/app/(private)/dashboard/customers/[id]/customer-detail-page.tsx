"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { CustomerDTO } from "@/domain/customer/customer-types";
import { useCustomer } from "@/domain/customer/useCases/use-customer";
import { useDeleteCustomer } from "@/domain/customer/useCases/use-delete-customer";
import { ApiClientError } from "@/domain/utils/api-utils";

function formatValue(value: string | null): string {
  return value === null || value === "" ? "—" : value;
}

function DetailRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-[0.125rem] text-[1rem] whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function CustomerDetails({ dto }: { dto: CustomerDTO }): React.ReactElement {
  return (
    <dl className="grid gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <DetailRow label="Tipo" value={dto.type === "PF" ? "Pessoa física" : "Pessoa jurídica"} />
      <DetailRow label="Nome" value={dto.name} />
      <DetailRow label="Nome fantasia" value={formatValue(dto.tradeName)} />
      <DetailRow label="Documento" value={formatValue(dto.document)} />
      <DetailRow label="Email" value={formatValue(dto.email)} />
      <DetailRow label="Telefone" value={formatValue(dto.phone)} />
      <DetailRow label="Telefone secundário" value={formatValue(dto.secondaryPhone)} />
      <DetailRow label="CEP" value={formatValue(dto.zipCode)} />
      <DetailRow label="UF" value={formatValue(dto.state)} />
      <DetailRow label="Cidade" value={formatValue(dto.city)} />
      <DetailRow label="Bairro" value={formatValue(dto.neighborhood)} />
      <DetailRow label="Logradouro" value={formatValue(dto.street)} />
      <DetailRow label="Número" value={formatValue(dto.number)} />
      <DetailRow label="Complemento" value={formatValue(dto.complement)} />
      <DetailRow label="Notas" value={formatValue(dto.notes)} />
      <div>
        <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Situação</dt>
        <dd className="mt-[0.125rem] text-[1rem]">
          {dto.isActive ? (
            <span className="text-emerald-700 dark:text-emerald-400">Ativo</span>
          ) : (
            <span className="text-zinc-500">Inativo</span>
          )}
        </dd>
      </div>
      <DetailRow
        label="Criado em"
        value={new Date(dto.createdAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
      />
      <DetailRow
        label="Atualizado em"
        value={new Date(dto.updatedAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
      />
    </dl>
  );
}

interface CustomerDetailPageProps {
  id: string;
}

export function CustomerDetailPage({ id }: CustomerDetailPageProps): React.ReactElement {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCustomer(id);

  const remove = useDeleteCustomer({
    onSuccess: () => {
      router.push("/dashboard/customers");
      router.refresh();
    },
  });

  function handleDeactivate(): void {
    if (!data) return;
    if (!data.isActive) return;
    const ok = window.confirm("Desativar este cliente? Poderá voltar a incluir inativos na lista.");
    if (!ok) return;
    remove.mutate(data.id);
  }

  const notFound =
    isError &&
    error instanceof ApiClientError &&
    (error.status === 404 || error.code === "NOT_FOUND" || error.code === "VALIDATION_ERROR");

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/customers"
        >
          Voltar à lista
        </Link>
        {data ? (
          <div className="flex flex-wrap gap-[0.5rem]">
            <Link
              className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium dark:border-zinc-600"
              href={`/dashboard/customers/${data.id}/edit`}
            >
              Editar
            </Link>
            {data.isActive ? (
              <button
                type="button"
                className="rounded-full border border-red-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-red-800 disabled:opacity-50 dark:border-red-900 dark:text-red-200"
                disabled={remove.isPending}
                onClick={handleDeactivate}
              >
                {remove.isPending ? "A desativar…" : "Desativar"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-[0.9375rem] text-zinc-500">A carregar…</p>
      ) : notFound ? (
        <div className="rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
          <p className="text-[0.9375rem]">Cliente não encontrado.</p>
          <Link className="mt-[0.75rem] inline-block font-medium underline" href="/dashboard/customers">
            Voltar à lista
          </Link>
        </div>
      ) : isError ? (
        <div className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {error instanceof ApiClientError ? error.message : "Erro ao carregar o cliente."}
        </div>
      ) : data ? (
        <>
          <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">{data.name}</h2>
          <CustomerDetails dto={data} />
          {remove.isError && remove.error instanceof ApiClientError ? (
            <p className="text-[0.875rem] text-red-600">{remove.error.message}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
