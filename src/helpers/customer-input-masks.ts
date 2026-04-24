export type PersonTypeForMask = "PF" | "PJ";

export function normalizeDocumentInput(value: string, type: PersonTypeForMask): string {
  const digits = value.replace(/\D/g, "");
  return type === "PF" ? digits.slice(0, 11) : digits.slice(0, 14);
}

export function formatDocumentDisplay(digits: string, type: PersonTypeForMask): string {
  const d =
    type === "PF" ? digits.slice(0, 11).replace(/\D/g, "") : digits.slice(0, 14).replace(/\D/g, "");

  if (type === "PF") {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function normalizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const area = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length === 0) return `(${area}) `;
  if (rest.length <= 8) {
    if (rest.length <= 4) return `(${area}) ${rest}`;
    return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function normalizeCepInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCepDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatDtoDocumentForForm(
  type: PersonTypeForMask,
  documentFromApi: string | null | undefined,
): string {
  return normalizeDocumentInput(documentFromApi ?? "", type);
}
