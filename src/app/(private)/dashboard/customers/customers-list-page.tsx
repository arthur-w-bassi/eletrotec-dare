"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCustomers } from "@/domain/customer/useCases/use-customers";
import { ApiClientError } from "@/domain/utils/api-utils";
import { cn } from "@/helpers/cn";

const PAGE_SIZE = 20;

export function CustomersListPage(): React.ReactElement {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);

  const queryParams = useMemo(
    () => ({
      search,
      page,
      pageSize: PAGE_SIZE,
      includeInactive,
    }),
    [search, page, includeInactive],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useCustomers(queryParams);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function applySearch(): void {
    setSearch(draftSearch.trim() === "" ? undefined : draftSearch.trim());
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <Link
          className="rounded-full bg-foreground px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-background"
          href="/dashboard/customers/new"
        >
          Novo cliente
        </Link>
      </div>

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="customer-search">
              Pesquisar
            </label>
            <input
              id="customer-search"
              type="search"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              placeholder="Nome, documento ou telefone"
              className="rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600"
            />
          </div>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
            onClick={applySearch}
          >
            Aplicar
          </button>
          <label className="flex cursor-pointer items-center gap-[0.5rem] text-[0.875rem]">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => {
                setIncludeInactive(e.target.checked);
                setPage(1);
              }}
              className="h-[1rem] w-[1rem] rounded border-zinc-300"
            />
            Incluir inativos
          </label>
        </div>
      </div>

      {isError ? (
        <div className="rounded-[0.5rem] border border-red-200 bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p>
            {error instanceof ApiClientError
              ? error.message
              : "Não foi possível carregar os clientes."}
          </p>
          <button
            type="button"
            className="mt-[0.5rem] font-medium underline"
            onClick={() => void refetch()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "overflow-x-auto rounded-[0.75rem] border border-zinc-200 dark:border-zinc-800",
          isFetching && !isLoading && "opacity-70",
        )}
      >
        <table className="w-full min-w-[36rem] border-collapse text-left text-[0.875rem]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Nome</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Tipo</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Documento</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-[0.75rem] py-[1rem] text-zinc-500" colSpan={4}>
                  A carregar…
                </td>
              </tr>
            ) : data && data.items.length === 0 ? (
              <tr>
                <td className="px-[0.75rem] py-[1.5rem]" colSpan={4}>
                  <p className="mb-[0.75rem] text-zinc-600 dark:text-zinc-400">
                    Nenhum cliente encontrado.
                  </p>
                  <Link
                    className="font-medium text-foreground underline"
                    href="/dashboard/customers/new"
                  >
                    Criar primeiro cliente
                  </Link>
                </td>
              </tr>
            ) : (
              data?.items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
                >
                  <td className="px-[0.75rem] py-[0.625rem]">
                    <Link className="font-medium text-foreground underline" href={`/dashboard/customers/${row.id}`}>
                      {row.name}
                    </Link>
                    {row.tradeName ? (
                      <span className="block text-[0.8125rem] text-zinc-500">{row.tradeName}</span>
                    ) : null}
                  </td>
                  <td className="px-[0.75rem] py-[0.625rem]">{row.type}</td>
                  <td className="px-[0.75rem] py-[0.625rem] font-mono text-[0.8125rem]">
                    {row.document ?? "—"}
                  </td>
                  <td className="px-[0.75rem] py-[0.625rem]">
                    {row.isActive ? (
                      <span className="text-emerald-700 dark:text-emerald-400">Ativo</span>
                    ) : (
                      <span className="text-zinc-500">Inativo</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-[0.75rem] text-[0.875rem]">
          <p className="text-zinc-600 dark:text-zinc-400">
            Página {data.page} de {totalPages} ({data.total} no total)
          </p>
          <div className="flex flex-wrap gap-[0.5rem]">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              className="rounded-full border border-zinc-300 px-[0.875rem] py-[0.375rem] font-medium transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:hover:bg-zinc-900"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              className="rounded-full border border-zinc-300 px-[0.875rem] py-[0.375rem] font-medium transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:hover:bg-zinc-900"
              onClick={() => setPage((p) => p + 1)}
            >
              Seguinte
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
