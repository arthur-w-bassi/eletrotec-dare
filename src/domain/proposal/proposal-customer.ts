import type { CustomerDTO } from "@/domain/customer/customer-types";
import {
  formatCepDisplay,
  formatDocumentDisplay,
  formatPhoneDisplay,
} from "@/helpers/customer-input-masks";

import type { ProposalCover } from "./proposal-types";

function capitalizeFirst(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getCustomerDisplayName(customer: CustomerDTO): string {
  if (customer.type === "PJ" && customer.tradeName?.trim()) {
    return customer.tradeName.trim();
  }
  return customer.name.trim();
}

export function buildCustomerAddress(customer: CustomerDTO): string {
  const parts: string[] = [];

  if (customer.street?.trim()) {
    let streetLine = customer.street.trim();
    if (customer.number?.trim()) {
      streetLine += `, ${customer.number.trim()}`;
    }
    if (customer.complement?.trim()) {
      streetLine += ` — ${customer.complement.trim()}`;
    }
    parts.push(streetLine);
  }

  if (customer.neighborhood?.trim()) {
    parts.push(customer.neighborhood.trim());
  }

  if (customer.city?.trim() && customer.state?.trim()) {
    parts.push(`${customer.city.trim()} — ${customer.state.trim()}`);
  } else if (customer.city?.trim()) {
    parts.push(customer.city.trim());
  }

  if (customer.zipCode?.trim()) {
    const cep = formatCepDisplay(customer.zipCode);
    if (parts.length > 0) {
      parts[parts.length - 1] = `${parts[parts.length - 1]}, CEP ${cep}`;
    } else {
      parts.push(`CEP ${cep}`);
    }
  }

  return parts.join(", ");
}

export function buildCustomerContact(customer: CustomerDTO): string {
  if (customer.phone?.trim()) {
    return formatPhoneDisplay(customer.phone);
  }
  if (customer.secondaryPhone?.trim()) {
    return formatPhoneDisplay(customer.secondaryPhone);
  }
  if (customer.email?.trim()) {
    return customer.email.trim();
  }
  return "";
}

export function buildCustomerDocument(customer: CustomerDTO): string {
  if (!customer.document?.trim()) return "";
  return formatDocumentDisplay(customer.document, customer.type);
}

export function mapCustomerToCoverFields(customer: CustomerDTO): Partial<ProposalCover> {
  return {
    customerId: customer.id,
    client: getCustomerDisplayName(customer),
    clientAddress: buildCustomerAddress(customer),
    clientDocument: buildCustomerDocument(customer),
    clientContact: buildCustomerContact(customer),
  };
}

export function formatProposalMonthYear(date: Date = new Date()): string {
  const formatted = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return capitalizeFirst(formatted);
}

export function formatProposalSignatureDate(date: Date = new Date()): string {
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return capitalizeFirst(formatted);
}

export function generateProposalNumber(existingNumbers: string[] = []): string {
  const year = new Date().getFullYear();
  const prefix = `PR-${year}-`;
  const sequenceValues = existingNumbers
    .filter((number) => number.startsWith(prefix))
    .map((number) => Number.parseInt(number.slice(prefix.length), 10))
    .filter((value) => !Number.isNaN(value));

  const next = sequenceValues.length > 0 ? Math.max(...sequenceValues) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
