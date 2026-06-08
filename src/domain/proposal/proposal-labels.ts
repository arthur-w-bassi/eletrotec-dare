import type { ServiceCategory } from "./proposal-types";

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory | "All", string> = {
  All: "Todas",
  Electrical: "Elétrica",
  HVAC: "HVAC",
  Plumbing: "Hidráulica",
  Maintenance: "Manutenção",
  Inspection: "Inspeção",
};

export function getCategoryLabel(category: ServiceCategory | "All"): string {
  return SERVICE_CATEGORY_LABELS[category];
}
