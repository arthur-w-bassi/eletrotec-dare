"use client";

import { Building2, Check, Loader2, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { CustomerDTO } from "@/domain/customer/customer-types";
import { useCustomers } from "@/domain/customer/useCases/use-customers";
import {
  buildCustomerDocument,
  getCustomerDisplayName,
} from "@/domain/proposal/proposal-customer";
import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "../proposal-builder-provider";
import { BuilderButton } from "../ui/builder-button";
import { BuilderInput } from "../ui/builder-input";

const SEARCH_DEBOUNCE_MS = 350;
const CUSTOMER_LIST_PAGE_SIZE = 8;

interface CustomerResultItemProps {
  customer: CustomerDTO;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (customer: CustomerDTO) => void;
  onHover: () => void;
}

function CustomerResultItem({
  customer,
  isActive,
  isSelected,
  onSelect,
  onHover,
}: CustomerResultItemProps): React.ReactElement {
  const displayName = getCustomerDisplayName(customer);
  const document = buildCustomerDocument(customer);
  const location = [customer.city, customer.state].filter(Boolean).join(" — ");
  const Icon = customer.type === "PJ" ? Building2 : User;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onHover}
      onClick={() => onSelect(customer)}
      className={cn(
        "flex w-full items-start gap-[0.75rem] rounded-[0.5rem] px-[0.75rem] py-[0.625rem] text-left transition-colors",
        isActive ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
      )}
    >
      <span
        className={cn(
          "mt-[0.125rem] flex size-[2rem] shrink-0 items-center justify-center rounded-full",
          customer.type === "PJ"
            ? "bg-[var(--eletrotec-orange-soft)] text-[var(--eletrotec-orange)]"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        )}
        aria-hidden
      >
        <Icon className="size-[0.875rem]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.875rem] font-medium text-foreground">{displayName}</span>
        <span className="mt-[0.125rem] block truncate text-[0.75rem] text-zinc-500">
          {[document, location].filter(Boolean).join(" · ") || "Sem documento ou localização"}
        </span>
      </span>
      {isSelected ? <Check className="mt-[0.25rem] size-[1rem] shrink-0 text-[var(--eletrotec-orange)]" aria-hidden /> : null}
    </button>
  );
}

export function CoverClientPicker(): React.ReactElement {
  const { proposal, applyCustomerToCover, updateCover, showToast } = useProposalBuilder();
  const listboxId = useId();
  const searchInputId = `${listboxId}-search`;
  const containerRef = useRef<HTMLDivElement>(null);

  const [draftSearch, setDraftSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(() => !proposal.cover.customerId);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasLinkedCustomer = Boolean(proposal.cover.customerId?.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(draftSearch.trim() === "" ? undefined : draftSearch.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draftSearch]);

  const customerParams = useMemo(
    () => ({
      search: debouncedSearch,
      page: 1,
      pageSize: CUSTOMER_LIST_PAGE_SIZE,
      includeInactive: false,
    }),
    [debouncedSearch],
  );

  const { data, isLoading, isFetching, isError } = useCustomers(customerParams);
  const customers = data?.items ?? [];

  useEffect(() => {
    setActiveIndex(0);
  }, [customers, debouncedSearch]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) {
        if (hasLinkedCustomer) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [hasLinkedCustomer]);

  function handleSelectCustomer(customer: CustomerDTO): void {
    applyCustomerToCover(customer);
    setDraftSearch("");
    setDebouncedSearch(undefined);
    setIsExpanded(false);
    showToast(`Cliente "${getCustomerDisplayName(customer)}" vinculado à proposta`);
  }

  function handleClearCustomer(): void {
    updateCover({
      customerId: undefined,
      client: "",
      clientAddress: "",
      clientDocument: "",
      clientContact: "",
    });
    setDraftSearch("");
    setDebouncedSearch(undefined);
    setIsExpanded(true);
    setActiveIndex(0);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (customers.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, customers.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const customer = customers[activeIndex];
      if (customer) {
        handleSelectCustomer(customer);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (hasLinkedCustomer) {
        setIsExpanded(false);
      }
    }
  }

  const showResults = isExpanded && (draftSearch.length > 0 || customers.length > 0 || isLoading);

  return (
    <div
      ref={containerRef}
      className="mx-auto mb-[1.25rem] w-full max-w-[49.625rem]"
    >
      <div className="overflow-hidden rounded-[0.75rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 bg-[var(--eletrotec-orange-soft)] px-[1.125rem] py-[0.625rem] dark:border-zinc-800">
          <div className="flex items-center justify-between gap-[0.75rem]">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--eletrotec-orange)]">
                Cliente da proposta
              </p>
              <p className="mt-[0.125rem] text-[0.8125rem] text-zinc-600 dark:text-zinc-400">
                Pesquise no cadastro para preencher os dados automaticamente
              </p>
            </div>
            {hasLinkedCustomer ? (
              <BuilderButton
                variant="ghost"
                className="shrink-0 text-[0.75rem]"
                onClick={() => setIsExpanded((value) => !value)}
              >
                {isExpanded ? "Fechar" : "Trocar"}
              </BuilderButton>
            ) : null}
          </div>
        </div>

        <div className="p-[1rem]">
          {hasLinkedCustomer && !isExpanded ? (
            <div className="flex items-start justify-between gap-[0.75rem] rounded-[0.625rem] border border-zinc-200 bg-zinc-50/80 px-[0.875rem] py-[0.75rem] dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="min-w-0">
                <p className="truncate text-[0.9375rem] font-semibold text-foreground">
                  {proposal.cover.client || "Cliente selecionado"}
                </p>
                <p className="mt-[0.25rem] truncate text-[0.8125rem] text-zinc-500">
                  {[proposal.cover.clientDocument, proposal.cover.clientContact]
                    .filter((value) => value?.trim())
                    .join(" · ") || "Dados preenchidos — edite diretamente no documento se necessário"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearCustomer}
                className="inline-flex shrink-0 items-center justify-center rounded-full p-[0.375rem] text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-foreground dark:hover:bg-zinc-800"
                aria-label="Remover cliente vinculado"
              >
                <X className="size-[1rem]" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-[0.75rem]">
              <div className="relative">
                <label className="sr-only" htmlFor={searchInputId}>
                  Pesquisar cliente
                </label>
                <Search
                  className="pointer-events-none absolute left-[0.75rem] top-1/2 size-[1rem] -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
                <BuilderInput
                  id={searchInputId}
                  type="search"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  onFocus={() => setIsExpanded(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Nome, documento ou telefone do cliente"
                  className="pl-[2.375rem]"
                  role="combobox"
                  aria-expanded={showResults}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  autoComplete="off"
                />
                {isFetching ? (
                  <Loader2
                    className="absolute right-[0.75rem] top-1/2 size-[1rem] -translate-y-1/2 animate-spin text-zinc-400"
                    aria-hidden
                  />
                ) : null}
              </div>

              {showResults ? (
                <div
                  id={listboxId}
                  role="listbox"
                  aria-label="Resultados de clientes"
                  className="max-h-[14rem] overflow-y-auto rounded-[0.625rem] border border-zinc-200 bg-background dark:border-zinc-800"
                >
                  {isLoading ? (
                    <p className="px-[0.875rem] py-[1rem] text-center text-[0.8125rem] text-zinc-500">
                      A pesquisar clientes…
                    </p>
                  ) : isError ? (
                    <p className="px-[0.875rem] py-[1rem] text-center text-[0.8125rem] text-red-600">
                      Não foi possível carregar os clientes.
                    </p>
                  ) : customers.length === 0 ? (
                    <div className="px-[0.875rem] py-[1rem] text-center">
                      <p className="text-[0.8125rem] text-zinc-500">
                        {debouncedSearch
                          ? "Nenhum cliente encontrado para esta pesquisa."
                          : "Digite para pesquisar clientes cadastrados."}
                      </p>
                      <Link
                        href="/dashboard/customers/new"
                        className="mt-[0.5rem] inline-block text-[0.8125rem] font-medium text-foreground underline"
                      >
                        Cadastrar novo cliente
                      </Link>
                    </div>
                  ) : (
                    <div className="p-[0.375rem]">
                      {customers.map((customer, index) => (
                        <CustomerResultItem
                          key={customer.id}
                          customer={customer}
                          isActive={index === activeIndex}
                          isSelected={customer.id === proposal.cover.customerId}
                          onSelect={handleSelectCustomer}
                          onHover={() => setActiveIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <p className="text-[0.75rem] text-zinc-500">
                Os campos do cliente na capa serão preenchidos automaticamente. Você pode ajustá-los
                manualmente depois.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
