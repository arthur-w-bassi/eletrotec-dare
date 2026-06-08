import type { MockProposal, ProposalFinancialSummary, ProposalLineItem } from "./proposal-types";

function lineTotal(item: ProposalLineItem): number {
  return item.qty * item.unitPrice;
}

export function calculateFinancialSummary(proposal: MockProposal): ProposalFinancialSummary {
  const subtotal = proposal.lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = subtotal * (proposal.financial.discountPercent / 100);
  const taxable = subtotal - discount;
  const tax = taxable * (proposal.financial.taxPercent / 100);
  const grandTotal = taxable + tax;

  return { subtotal, discount, taxable, tax, grandTotal };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}
