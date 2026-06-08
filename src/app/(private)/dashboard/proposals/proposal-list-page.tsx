"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ProposalStatusValue } from "@/domain/proposal/proposal-types";
import { useProposals } from "@/domain/proposal/useCases/use-proposals";
import { cn } from "@/helpers/cn";

import { ProposalStatusBadge } from "./proposal-status-badge";

const PAGE_SIZE = 20;

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatMoney(value: number): string {
  return money.format(value);
}

type StatusFilter = undefined | ProposalStatusValue;

export function ProposalListPage(): React.ReactElement {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const queryParams = useMemo(
    () => ({
      search,
      status: statusFilter,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, page, statusFilter],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useProposals(queryParams);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function applySearch(): void {
    setSearch(draftSearch.trim() === "" ? undefined : draftSearch.trim());
    setPage(1);
  }

  function setStatusSegment(next: StatusFilter): void {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <Link
          className="rounded-full bg-foreground px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-background"
          href="/dashboard/proposals/builder"
        >
          Nova proposta
        </Link>
      </div>

      <div className="flex flex-col gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <div className="flex flex-wrap gap-[0.5rem]">
          <span className="w-full text-[0.8125rem] font-medium text-zinc-600 dark:text-zinc-400">
            Estado
          </span>
          <div className="flex flex-wrap gap-[0.375rem]">
            <button
              type="button"
              onClick={() => setStatusSegment(undefined)}
              className={cn(
                "rounded-full border px-[0.875rem] py-[0.375rem] text-[0.8125rem] font-medium transition-colors",
                statusFilter === undefined
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900",
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusSegment("draft")}
              className={cn(
                "rounded-full border px-[0.875rem] py-[0.375rem] text-[0.8125rem] font-medium transition-colors",
                statusFilter === "draft"
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900",
              )}
            >
              Rascunho
            </button>
            <button
              type="button"
              onClick={() => setStatusSegment("completed")}
              className={cn(
                "rounded-full border px-[0.875rem] py-[0.375rem] text-[0.8125rem] font-medium transition-colors",
                statusFilter === "completed"
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900",
              )}
            >
              Concluído
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[0.5rem] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-[0.25rem]">
            <label className="text-[0.875rem] font-medium" htmlFor="proposal-search">
              Pesquisar
            </label>
            <input
              id="proposal-search"
              type="search"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              placeholder="Cliente, título ou número da proposta"
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
        </div>
      </div>

      {isError ? (
        <div className="rounded-[0.5rem] border border-red-200 bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p>{error?.message ?? "Não foi possível carregar os orçamentos."}</p>
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
        <table className="w-full min-w-[42rem] border-collapse text-left text-[0.875rem]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Proposta</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Cliente</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Título</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Estado</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Serviços</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Total</th>
              <th className="px-[0.75rem] py-[0.625rem] font-medium">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-[0.75rem] py-[1rem] text-zinc-500" colSpan={7}>
                  A carregar…
                </td>
              </tr>
            ) : data && data.items.length === 0 ? (
              <tr>
                <td className="px-[0.75rem] py-[1.5rem]" colSpan={7}>
                  <p className="mb-[0.75rem] text-zinc-600 dark:text-zinc-400">
                    Nenhum orçamento encontrado.
                  </p>
                  <Link
                    className="font-medium text-foreground underline"
                    href="/dashboard/proposals/builder"
                  >
                    Criar primeira proposta
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
                    <Link
                      className="font-medium text-foreground underline"
                      href={`/dashboard/proposals/${row.id}`}
                    >
                      {row.number}
                    </Link>
                  </td>
                  <td className="px-[0.75rem] py-[0.625rem]">{row.client}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{row.title}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">
                    <ProposalStatusBadge status={row.status} />
                  </td>
                  <td className="px-[0.75rem] py-[0.625rem]">{row.serviceCount}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">{formatMoney(row.grandTotal)}</td>
                  <td className="px-[0.75rem] py-[0.625rem]">
                    {new Date(row.updatedAt).toLocaleString("pt-PT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
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
