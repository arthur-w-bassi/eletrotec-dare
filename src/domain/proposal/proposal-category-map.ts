import type { ServiceCategory as PrismaServiceCategory } from "@/generated/prisma/client";

import type { ServiceCategory } from "./proposal-types";

const UI_TO_PRISMA: Record<ServiceCategory, PrismaServiceCategory> = {
  Electrical: "ELECTRICAL",
  HVAC: "HVAC",
  Plumbing: "PLUMBING",
  Maintenance: "MAINTENANCE",
  Inspection: "INSPECTION",
};

const PRISMA_TO_UI: Record<PrismaServiceCategory, ServiceCategory> = {
  ELECTRICAL: "Electrical",
  HVAC: "HVAC",
  PLUMBING: "Plumbing",
  MAINTENANCE: "Maintenance",
  INSPECTION: "Inspection",
};

export function mapUiServiceCategoryToPrisma(
  category: ServiceCategory,
): PrismaServiceCategory {
  return UI_TO_PRISMA[category];
}

export function mapPrismaServiceCategoryToUi(
  category: PrismaServiceCategory | null | undefined,
): ServiceCategory {
  if (!category) return "Maintenance";
  return PRISMA_TO_UI[category];
}
