"use client";

import { CalendarPlus, Trash2 } from "lucide-react";

import type { ProposalBlock, ProposalScheduleItem } from "@/domain/proposal/proposal-types";

import { useProposalBuilder } from "../proposal-builder-provider";
import { BuilderButton } from "../ui/builder-button";

interface Props {
  block: Extract<ProposalBlock, { type: "schedule" }>;
}

interface ScheduleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}

function ScheduleField({
  value,
  onChange,
  placeholder,
  multiline = false,
}: ScheduleFieldProps): React.ReactElement {
  const className =
    "w-full rounded-[0.375rem] border border-transparent bg-transparent px-[0.5rem] py-[0.375rem] text-[0.8125rem] leading-[1.35] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-200 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`${className} resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function ScheduleBlockContent({ block }: Props): React.ReactElement {
  const { addScheduleItem, removeScheduleItem, updateScheduleItem } = useProposalBuilder();

  function handleUpdateItem(
    item: ProposalScheduleItem,
    updates: Partial<Pick<ProposalScheduleItem, "period" | "activity" | "notes">>,
  ): void {
    updateScheduleItem(block.id, item.id, updates);
  }

  return (
    <div>
      <div className="mb-[0.75rem] flex flex-wrap items-center justify-between gap-[0.5rem]">
        <h4 className="text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
          Cronograma
        </h4>
        <BuilderButton
          variant="ghost"
          data-builder-chrome
          onClick={() => addScheduleItem(block.id)}
        >
          <CalendarPlus className="size-[0.875rem]" aria-hidden />
          Adicionar etapa
        </BuilderButton>
      </div>

      {block.items.length === 0 ? (
        <div className="rounded-[0.625rem] border border-dashed border-zinc-200 bg-zinc-50/50 px-[1rem] py-[1.5rem] text-center">
          <p className="text-[0.875rem] text-zinc-500">
            Nenhuma etapa no cronograma. Adicione o que será feito e observações por fase.
          </p>
          <BuilderButton
            variant="secondary"
            className="mt-[0.75rem]"
            data-builder-chrome
            onClick={() => addScheduleItem(block.id)}
          >
            <CalendarPlus className="size-[0.875rem]" aria-hidden />
            Adicionar primeira etapa
          </BuilderButton>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[0.625rem] border border-zinc-200">
          <table className="w-full text-[0.8125rem]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500">
                <th className="w-[7rem] px-[0.75rem] py-[0.625rem] font-medium">Prazo</th>
                <th className="px-[0.75rem] py-[0.625rem] font-medium">O que será feito</th>
                <th className="px-[0.75rem] py-[0.625rem] font-medium">Observações</th>
                <th
                  data-builder-chrome
                  className="w-[2.5rem] px-[0.5rem] py-[0.625rem]"
                  aria-label="Ações"
                />
              </tr>
            </thead>
            <tbody>
              {block.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                >
                  <td className="align-top px-[0.375rem] py-[0.375rem]">
                    <ScheduleField
                      value={item.period}
                      onChange={(period) => handleUpdateItem(item, { period })}
                      placeholder="Ex.: Semana 1"
                    />
                  </td>
                  <td className="align-top px-[0.375rem] py-[0.375rem]">
                    <ScheduleField
                      value={item.activity}
                      onChange={(activity) => handleUpdateItem(item, { activity })}
                      placeholder="Descreva a atividade..."
                      multiline
                    />
                  </td>
                  <td className="align-top px-[0.375rem] py-[0.375rem]">
                    <ScheduleField
                      value={item.notes}
                      onChange={(notes) => handleUpdateItem(item, { notes })}
                      placeholder="Observações da etapa..."
                      multiline
                    />
                  </td>
                  <td data-builder-chrome className="align-top px-[0.25rem] py-[0.375rem]">
                    <button
                      type="button"
                      data-builder-chrome
                      onClick={() => removeScheduleItem(block.id, item.id)}
                      className="flex size-[1.75rem] items-center justify-center rounded-[0.375rem] text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Remover etapa"
                    >
                      <Trash2 className="size-[0.875rem]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
