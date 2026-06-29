"use client";

import { Search } from "lucide-react";

import { SERVICE_CATEGORIES } from "@/domain/proposal/proposal-types";
import { useProposalServices } from "@/domain/proposal/useCases/use-proposal-services";
import { useProposalTemplates } from "@/domain/proposal/useCases/use-proposal-templates";

import { useDebouncedValue } from "../hooks/use-media-query";
import { useProposalBuilder } from "../proposal-builder-provider";
import { BuilderInput } from "../ui/builder-input";
import { CategoryFilter } from "./category-filter";
import { LibraryTabs } from "./library-tabs";
import { ServicesList } from "./services-list";
import { TemplatesList } from "./templates-list";

interface Props {
  onClose?: () => void;
  showClose?: boolean;
}

export function ServicesLibrary({ onClose, showClose }: Props): React.ReactElement {
  const {
    librarySearch,
    setLibrarySearch,
    libraryCategory,
    setLibraryCategory,
    libraryTab,
    setLibraryTab,
  } = useProposalBuilder();

  const debouncedSearch = useDebouncedValue(librarySearch, 150);
  const search = debouncedSearch.trim() || undefined;
  const category = libraryCategory === "All" ? undefined : libraryCategory;
  const isTemplatesTab = libraryTab === "templates";

  const servicesQuery = useProposalServices({
    search,
    category,
    pageSize: 100,
  });

  const templatesQuery = useProposalTemplates({
    search,
    category,
    pageSize: 100,
  });

  const services = servicesQuery.services;
  const templates = templatesQuery.data?.items ?? [];
  const isLoading = isTemplatesTab ? templatesQuery.isLoading : servicesQuery.isLoading;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-[1rem] py-[0.875rem] dark:border-zinc-800">
        <h2 className="text-[0.8125rem] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Biblioteca de Serviços
        </h2>
        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-[0.375rem] p-[0.25rem] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
            aria-label="Fechar biblioteca"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-[0.75rem] border-b border-zinc-200 p-[1rem] dark:border-zinc-800">
        <LibraryTabs value={libraryTab} onChange={setLibraryTab} />

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-[0.625rem] top-1/2 size-[0.875rem] -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <BuilderInput
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder={isTemplatesTab ? "Buscar pré-modelos..." : "Buscar serviços..."}
            className="pl-[2rem]"
          />
        </div>

        <CategoryFilter
          categories={SERVICE_CATEGORIES}
          value={libraryCategory}
          onChange={setLibraryCategory}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-[1rem]">
        {isTemplatesTab ? (
          <TemplatesList templates={templates} isLoading={isLoading} />
        ) : (
          <ServicesList services={services} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
