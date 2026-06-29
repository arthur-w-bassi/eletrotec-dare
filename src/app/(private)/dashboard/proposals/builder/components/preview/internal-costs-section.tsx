"use client";

import { Plus, Trash2 } from "lucide-react";

import type { ProposalDocument } from "@/domain/proposal/proposal-types";
import {
  calculateInternalCostsTotal,
  formatCurrency,
} from "@/domain/proposal/proposal-calculations";

import { useProposalBuilder } from "../proposal-builder-provider";
import { BuilderButton } from "../ui/builder-button";
import { InlineEditableNumberField } from "./inline-editable-number-field";

interface Props {
  proposal: ProposalDocument;
}

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionField({ value, onChange }: DescriptionFieldProps): React.ReactElement {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Ex.: Imposto, Comissão, Custo operacional..."
      className="w-full rounded-[0.375rem] border border-transparent bg-transparent px-[0.5rem] py-[0.375rem] text-[0.8125rem] leading-[1.35] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-200 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200"
    />
  );
}

export function InternalCostsSection({ proposal }: Props): React.ReactElement {
  const { addInternalCost, removeInternalCost, updateInternalCost } = useProposalBuilder();
  const items = proposal.internalCosts ?? [];
  const total = calculateInternalCostsTotal(items);

  return (
    <section data-pdf-hidden className="mb-[2rem]">
      <div className="mb-[0.75rem] flex flex-wrap items-center justify-between gap-[0.5rem]">
        <div className="flex flex-wrap items-center gap-[0.5rem]">
          <h3 className="text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
            Valores internos
          </h3>
          <span className="rounded-full bg-amber-100 px-[0.5rem] py-[0.125rem] text-[0.625rem] font-medium uppercase tracking-wide text-amber-700">
            Não incluído no PDF
          </span>
        </div>
        <BuilderButton variant="ghost" data-builder-chrome onClick={addInternalCost}>
          <Plus className="size-[0.875rem]" aria-hidden />
          Adicionar valor
        </BuilderButton>
      </div>

      <div className="overflow-hidden rounded-[0.625rem] border border-amber-200/60 bg-amber-50/50">
        {items.length === 0 ? (
          <div className="px-[1rem] py-[1.5rem] text-center">
            <p className="text-[0.875rem] text-zinc-500">
              Adicione custos, impostos, comissões e outros valores internos relacionados aos
              serviços.
            </p>
            <BuilderButton
              variant="secondary"
              className="mt-[0.75rem]"
              data-builder-chrome
              onClick={addInternalCost}
            >
              <Plus className="size-[0.875rem]" aria-hidden />
              Adicionar primeiro valor
            </BuilderButton>
          </div>
        ) : (
          <>
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-amber-200/60 bg-amber-50 text-left text-zinc-500">
                  <th className="px-[0.875rem] py-[0.625rem] font-medium">Descrição</th>
                  <th className="w-[9rem] px-[0.875rem] py-[0.625rem] text-right font-medium">
                    Valor
                  </th>
                  <th
                    data-builder-chrome
                    className="w-[2.5rem] px-[0.5rem] py-[0.625rem]"
                    aria-label="Ações"
                  />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white/60" : "bg-amber-50/30"}
                  >
                    <td className="px-[0.375rem] py-[0.375rem]">
                      <DescriptionField
                        value={item.description}
                        onChange={(description) =>
                          updateInternalCost(item.id, { description })
                        }
                      />
                    </td>
                    <td className="px-[0.875rem] py-[0.375rem] text-right">
                      <InlineEditableNumberField
                        value={item.amount}
                        onChange={(amount) => updateInternalCost(item.id, { amount })}
                        min={0}
                        formatDisplay={formatCurrency}
                        ariaLabel={`Valor de ${item.description || "item interno"}`}
                        inputClassName="text-right text-zinc-900"
                      />
                    </td>
                    <td data-builder-chrome className="px-[0.25rem] py-[0.375rem]">
                      <button
                        type="button"
                        data-builder-chrome
                        onClick={() => removeInternalCost(item.id)}
                        className="flex size-[1.75rem] items-center justify-center rounded-[0.375rem] text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Remover valor"
                      >
                        <Trash2 className="size-[0.875rem]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-amber-200/60 bg-amber-50/80 px-[0.875rem] py-[0.75rem]">
              <dl className="ml-auto flex max-w-[16rem] flex-col gap-[0.375rem] text-[0.8125rem]">
                <div className="mt-[0.25rem] flex justify-between gap-[1rem] border-t border-amber-200/60 pt-[0.5rem] text-[0.9375rem]">
                  <dt className="font-semibold text-zinc-900">Total</dt>
                  <dd className="font-semibold text-zinc-900">{formatCurrency(total)}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
