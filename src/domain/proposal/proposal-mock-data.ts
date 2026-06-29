import { ELETROTEC_COMPANY } from "./eletrotec-company";
import {
  formatProposalMonthYear,
  formatProposalSignatureDate,
} from "./proposal-customer";
import type {
  ProposalDocument,
  ProposalInternalCostItem,
  ProposalLineItem,
  ProposalScheduleItem,
  ProposalService,
  ProposalTemplate,
} from "./proposal-types";
import { buildDefaultSectionOrder } from "./proposal-section-order";

export function createBlankProposal(): ProposalDocument {
  const now = new Date();

  return {
    status: "draft",
    cover: {
      title: "Proposta Comercial",
      client: "",
      clientAddress: "",
      clientDocument: "",
      clientContact: "",
      number: "",
      date: formatProposalMonthYear(now),
    },
    introduction: "",
    lineItems: [],
    blocks: [],
    schedule: [],
    notes: "",
    signature: {
      preparedBy: ELETROTEC_COMPANY.name,
      date: formatProposalSignatureDate(now),
    },
    financial: {
      discountPercent: 0,
      taxPercent: 0,
    },
    internalCosts: [],
  };
}

export function createLineItemFromService(service: ProposalService): ProposalLineItem {
  return {
    id: crypto.randomUUID(),
    serviceId: service.id,
    title: service.title,
    description: service.description,
    images: service.image ? [service.image] : [],
    qty: 1,
    unitPrice: service.price,
  };
}

export function createScheduleItem(overrides?: Partial<Omit<ProposalScheduleItem, "id">>): ProposalScheduleItem {
  return {
    id: crypto.randomUUID(),
    period: "",
    activity: "",
    notes: "",
    ...overrides,
  };
}

export function createInternalCostItem(
  overrides?: Partial<Omit<ProposalInternalCostItem, "id">>,
): ProposalInternalCostItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    amount: 0,
    ...overrides,
  };
}

export function buildProposalFromTemplate(
  template: ProposalTemplate,
  base: ProposalDocument,
  resolveService: (serviceId: string) => ProposalService | undefined,
): ProposalDocument {
  const lineItems = template.serviceIds
    .map((serviceId) => resolveService(serviceId))
    .filter((service): service is ProposalService => service !== undefined)
    .map((service) => createLineItemFromService(service));

  const schedule = template.schedule.map((entry) => createScheduleItem(entry));
  const nonScheduleBlocks = (base.blocks ?? []).filter((block) => block.type !== "schedule");
  const blocks = [
    ...nonScheduleBlocks,
    {
      id: crypto.randomUUID(),
      type: "schedule" as const,
      items: schedule,
    },
  ];

  return {
    ...base,
    introduction: template.introduction,
    lineItems,
    blocks,
    sectionOrder: buildDefaultSectionOrder(blocks),
    schedule: [],
  };
}
