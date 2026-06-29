import type {
  ProposalDocument,
  ProposalFinancialSummary,
  ProposalInternalCostItem,
  ProposalLineItem,
} from "./proposal-types";

function lineTotal(item: ProposalLineItem): number {
  return item.qty * item.unitPrice;
}

export function calculateFinancialSummary(proposal: ProposalDocument): ProposalFinancialSummary {
  const subtotal = proposal.lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = subtotal * (proposal.financial.discountPercent / 100);
  const taxable = subtotal - discount;
  const tax = taxable * (proposal.financial.taxPercent / 100);
  const grandTotal = taxable + tax;

  return { subtotal, discount, taxable, tax, grandTotal };
}

export function calculateInternalCostsTotal(items: ProposalInternalCostItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}
