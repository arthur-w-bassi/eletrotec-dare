"use client";

import { CalendarDays, FileText, Layers, Wrench } from "lucide-react";
import { useState } from "react";

import { getCategoryLabel } from "@/domain/proposal/proposal-labels";
import type { ProposalDocument, ProposalTemplate } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "../proposal-builder-provider";

interface Props {
  template: ProposalTemplate;
}

function hasExistingContent(proposal: ProposalDocument): boolean {
  const hasScheduleInBlocks = (proposal.blocks ?? []).some((block) => block.type === "schedule");
  return (
    proposal.introduction.trim().length > 0 ||
    proposal.lineItems.length > 0 ||
    (proposal.schedule ?? []).length > 0 ||
    hasScheduleInBlocks ||
    (proposal.blocks ?? []).some((block) => block.type !== "schedule")
  );
}

export function TemplateCard({ template }: Props): React.ReactElement {
  const { proposal, applyTemplate, showToast } = useProposalBuilder();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleApply = (): void => {
    if (hasExistingContent(proposal) && !isConfirming) {
      setIsConfirming(true);
      return;
    }

    applyTemplate(template);
    showToast(`Pré-modelo "${template.title}" aplicado`);
    setIsConfirming(false);
  };

  const handleCancel = (): void => {
    setIsConfirming(false);
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[0.625rem] border border-zinc-200 bg-zinc-50/80 transition-all duration-200 ease-out dark:border-zinc-700 dark:bg-zinc-900/50",
        "hover:-translate-y-px hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-600",
      )}
    >
      <div className="flex flex-col gap-[0.625rem] p-[0.875rem]">
        <div className="flex items-start justify-between gap-[0.5rem]">
          <div className="flex flex-col gap-[0.25rem]">
            <h3 className="text-[0.8125rem] font-semibold leading-[1.125rem] text-foreground">
              {template.title}
            </h3>
            <span className="inline-flex w-fit rounded-full bg-zinc-100 px-[0.5rem] py-[0.125rem] text-[0.6875rem] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {getCategoryLabel(template.category)}
            </span>
          </div>
          <Layers
            className="size-[1rem] shrink-0 text-zinc-400"
            aria-hidden
          />
        </div>

        <p className="text-[0.75rem] leading-[1.125rem] text-zinc-500">{template.description}</p>

        <div className="flex flex-wrap gap-[0.5rem] text-[0.6875rem] text-zinc-500">
          <span className="inline-flex items-center gap-[0.25rem]">
            <Wrench className="size-[0.75rem]" aria-hidden />
            {template.serviceIds.length} serviços
          </span>
          <span className="inline-flex items-center gap-[0.25rem]">
            <CalendarDays className="size-[0.75rem]" aria-hidden />
            {template.schedule.length} etapas
          </span>
          <span className="inline-flex items-center gap-[0.25rem]">
            <FileText className="size-[0.75rem]" aria-hidden />
            Introdução
          </span>
        </div>

        {isConfirming ? (
          <div className="flex flex-col gap-[0.5rem] rounded-[0.5rem] border border-amber-200 bg-amber-50 p-[0.625rem] dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-[0.75rem] leading-[1.125rem] text-amber-800 dark:text-amber-200">
              Isso substituirá a introdução, serviços e cronograma atuais. Deseja continuar?
            </p>
            <div className="flex gap-[0.375rem]">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-[0.375rem] bg-foreground px-[0.625rem] py-[0.375rem] text-[0.75rem] font-medium text-background transition-opacity hover:opacity-90"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-[0.375rem] border border-zinc-200 bg-background px-[0.625rem] py-[0.375rem] text-[0.75rem] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-[0.375rem] border border-zinc-200 bg-background px-[0.625rem] py-[0.5rem] text-[0.75rem] font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Aplicar pré-modelo
          </button>
        )}
      </div>
    </article>
  );
}
