"use client";

import type { MockProposal } from "@/domain/proposal/proposal-types";
import { calculateFinancialSummary, formatCurrency } from "@/domain/proposal/proposal-calculations";

import { useProposalBuilder } from "../proposal-builder-provider";
import { InlineEditableNumberField } from "./inline-editable-number-field";

interface Props {
  proposal: MockProposal;
}

export function FinancialSummarySection({ proposal }: Props): React.ReactElement {
  const { updateLineItem, updateFinancial } = useProposalBuilder();
  const summary = calculateFinancialSummary(proposal);

  return (
    <section className="mb-[2rem]">
      <h3 className="mb-[0.75rem] text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
        Resumo Financeiro
      </h3>

      <div className="overflow-hidden rounded-[0.625rem] border border-zinc-200">
        <table className="w-full text-[0.8125rem]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500">
              <th className="px-[0.875rem] py-[0.625rem] font-medium">Serviço</th>
              <th className="w-[4.5rem] px-[0.875rem] py-[0.625rem] font-medium">Qtd.</th>
              <th className="w-[7.5rem] px-[0.875rem] py-[0.625rem] font-medium">Preço Unit.</th>
              <th className="px-[0.875rem] py-[0.625rem] text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposal.lineItems.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
              >
                <td className="px-[0.875rem] py-[0.625rem] text-zinc-900">{item.title}</td>
                <td className="px-[0.875rem] py-[0.625rem] text-zinc-600">
                  <InlineEditableNumberField
                    value={item.qty}
                    onChange={(qty) => updateLineItem(item.id, { qty })}
                    min={1}
                    integer
                    ariaLabel={`Quantidade de ${item.title}`}
                    inputClassName="text-zinc-600"
                  />
                </td>
                <td className="px-[0.875rem] py-[0.625rem] text-zinc-600">
                  <InlineEditableNumberField
                    value={item.unitPrice}
                    onChange={(unitPrice) => updateLineItem(item.id, { unitPrice })}
                    min={0}
                    formatDisplay={formatCurrency}
                    ariaLabel={`Preço unitário de ${item.title}`}
                    inputClassName="text-zinc-600"
                  />
                </td>
                <td className="px-[0.875rem] py-[0.625rem] text-right font-medium text-zinc-900">
                  {formatCurrency(item.qty * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-zinc-200 bg-zinc-50/80 px-[0.875rem] py-[0.75rem]">
          <dl className="ml-auto flex max-w-[16rem] flex-col gap-[0.375rem] text-[0.8125rem]">
            <div className="flex justify-between gap-[1rem]">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-medium">{formatCurrency(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-[1rem]">
              <dt className="flex items-center gap-[0.25rem] text-zinc-500">
                <span>Desconto</span>
                <span className="text-zinc-400">(</span>
                <InlineEditableNumberField
                  value={proposal.financial.discountPercent}
                  onChange={(discountPercent) => updateFinancial({ discountPercent })}
                  min={0}
                  max={100}
                  ariaLabel="Percentual de desconto"
                  inputClassName="w-[2.5rem] text-center text-zinc-600"
                />
                <span className="text-zinc-400">%)</span>
              </dt>
              <dd className="font-medium text-red-600">-{formatCurrency(summary.discount)}</dd>
            </div>
            <div className="flex justify-between gap-[1rem]">
              <dt className="flex items-center gap-[0.25rem] text-zinc-500">
                <span>Impostos</span>
                <span className="text-zinc-400">(</span>
                <InlineEditableNumberField
                  value={proposal.financial.taxPercent}
                  onChange={(taxPercent) => updateFinancial({ taxPercent })}
                  min={0}
                  max={100}
                  ariaLabel="Percentual de impostos"
                  inputClassName="w-[2.5rem] text-center text-zinc-600"
                />
                <span className="text-zinc-400">%)</span>
              </dt>
              <dd className="font-medium">{formatCurrency(summary.tax)}</dd>
            </div>
            <div className="mt-[0.25rem] flex justify-between gap-[1rem] border-t border-zinc-200 pt-[0.5rem] text-[0.9375rem]">
              <dt className="font-semibold text-zinc-900">Total Geral</dt>
              <dd className="font-semibold text-zinc-900">{formatCurrency(summary.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
