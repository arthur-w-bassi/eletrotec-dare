"use client";

import { ArrowLeft, PanelLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/helpers/cn";

import { BuilderBadge } from "./ui/builder-badge";
import { BuilderButton } from "./ui/builder-button";
import { useProposalBuilder } from "./proposal-builder-provider";

interface Props {
  onToggleLibrary?: () => void;
  showLibraryToggle?: boolean;
}

export function ProposalBuilderHeader({
  onToggleLibrary,
  showLibraryToggle = false,
}: Props): React.ReactElement {
  const { saveDraft, generatePdf, previewPdf, proposal, isPdfGenerating, isSaving } =
    useProposalBuilder();

  return (
    <header className="flex h-[3.75rem] shrink-0 items-center justify-between gap-[1rem] border-b border-zinc-200 bg-background px-[1.25rem] dark:border-zinc-800">
      <div className="flex min-w-0 items-center gap-[0.875rem]">
        <Link
          href="/dashboard/proposals"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-[0.375rem] rounded-[0.375rem] px-[0.625rem] py-[0.375rem]",
            "text-[0.8125rem] font-medium text-zinc-600 transition-all duration-200 ease-out",
            "hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          )}
        >
          <ArrowLeft className="size-[1rem]" aria-hidden />
          Voltar
        </Link>
        {showLibraryToggle ? (
          <BuilderButton variant="ghost" className="shrink-0" onClick={onToggleLibrary}>
            <PanelLeft className="size-[1rem]" aria-hidden />
            Serviços
          </BuilderButton>
        ) : null}
        <div className="flex size-[2.25rem] shrink-0 items-center justify-center rounded-full bg-foreground text-[0.75rem] font-semibold text-background">
          SH
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[0.9375rem] font-semibold leading-[1.25rem] text-foreground">
            Construtor de Propostas
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-[0.75rem]">
        <BuilderBadge>
          {proposal.status === "completed" ? "Concluído" : "Rascunho"}
        </BuilderBadge>
        <div className="hidden items-center gap-[0.5rem] sm:flex">
          <BuilderButton
            variant="secondary"
            onClick={() => void saveDraft()}
            disabled={isSaving || isPdfGenerating}
          >
            {isSaving ? "A guardar…" : "Salvar Rascunho"}
          </BuilderButton>
          <BuilderButton
            variant="outline"
            onClick={() => void generatePdf()}
            disabled={isPdfGenerating || isSaving}
          >
            {isPdfGenerating ? "A gerar…" : "Gerar PDF"}
          </BuilderButton>
          <BuilderButton
            variant="primary"
            onClick={() => void previewPdf()}
            disabled={isPdfGenerating || isSaving}
          >
            {isPdfGenerating ? "A gerar…" : "Visualizar PDF"}
          </BuilderButton>
        </div>
      </div>
    </header>
  );
}
