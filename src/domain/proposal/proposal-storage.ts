import { calculateFinancialSummary } from "./proposal-calculations";
import { INITIAL_PROPOSAL } from "./proposal-mock-data";
import { normalizeProposal } from "./proposal-normalize";
import type { MockProposal, ProposalListItemDTO, StoredProposalRecord } from "./proposal-types";

const STORAGE_KEY = "eletrotec-proposal-records";

function toListItem(
  id: string,
  proposal: MockProposal,
  createdAt: string,
  updatedAt: string,
): ProposalListItemDTO {
  const summary = calculateFinancialSummary(proposal);
  return {
    id,
    number: proposal.cover.number,
    title: proposal.cover.title,
    client: proposal.cover.client,
    status: proposal.status,
    serviceCount: proposal.lineItems.length,
    grandTotal: summary.grandTotal,
    createdAt,
    updatedAt,
  };
}

export const SEED_PROPOSAL_LIST: ProposalListItemDTO[] = [
  toListItem(
    "seed-1",
    { ...INITIAL_PROPOSAL, id: "seed-1", status: "draft" },
    "2026-06-01T10:30:00.000Z",
    "2026-06-08T14:20:00.000Z",
  ),
  toListItem(
    "seed-2",
    {
      ...INITIAL_PROPOSAL,
      id: "seed-2",
      status: "completed",
      cover: {
        ...INITIAL_PROPOSAL.cover,
        number: "PR-2026-002",
        client: "Logística Norte S.A.",
        date: "Maio de 2026",
      },
    },
    "2026-05-12T09:15:00.000Z",
    "2026-05-28T16:45:00.000Z",
  ),
  toListItem(
    "seed-3",
    {
      ...INITIAL_PROPOSAL,
      id: "seed-3",
      status: "completed",
      cover: {
        ...INITIAL_PROPOSAL.cover,
        number: "PR-2025-048",
        client: "Indústria Metalúrgica Silva",
        title: "Proposta de Manutenção Anual",
        date: "Dezembro de 2025",
      },
      lineItems: INITIAL_PROPOSAL.lineItems.slice(0, 2),
    },
    "2025-12-03T11:00:00.000Z",
    "2025-12-18T10:10:00.000Z",
  ),
  toListItem(
    "seed-4",
    {
      ...INITIAL_PROPOSAL,
      id: "seed-4",
      status: "draft",
      cover: {
        ...INITIAL_PROPOSAL.cover,
        number: "PR-2026-003",
        client: "Hospital Regional Sul",
        date: "Junho de 2026",
      },
      lineItems: [INITIAL_PROPOSAL.lineItems[0]!],
    },
    "2026-06-05T08:00:00.000Z",
    "2026-06-07T17:30:00.000Z",
  ),
];

export const SEED_PROPOSAL_RECORDS: Record<string, MockProposal> = {
  "seed-1": { ...INITIAL_PROPOSAL, id: "seed-1", status: "draft" },
  "seed-2": {
    ...INITIAL_PROPOSAL,
    id: "seed-2",
    status: "completed",
    cover: {
      ...INITIAL_PROPOSAL.cover,
      number: "PR-2026-002",
      client: "Logística Norte S.A.",
      date: "Maio de 2026",
    },
  },
  "seed-3": {
    ...INITIAL_PROPOSAL,
    id: "seed-3",
    status: "completed",
    cover: {
      ...INITIAL_PROPOSAL.cover,
      number: "PR-2025-048",
      client: "Indústria Metalúrgica Silva",
      title: "Proposta de Manutenção Anual",
      date: "Dezembro de 2025",
    },
    lineItems: INITIAL_PROPOSAL.lineItems.slice(0, 2),
  },
  "seed-4": {
    ...INITIAL_PROPOSAL,
    id: "seed-4",
    status: "draft",
    cover: {
      ...INITIAL_PROPOSAL.cover,
      number: "PR-2026-003",
      client: "Hospital Regional Sul",
      date: "Junho de 2026",
    },
    lineItems: [INITIAL_PROPOSAL.lineItems[0]!],
  },
};

function readStorageRecords(): StoredProposalRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredProposalRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorageRecords(records: StoredProposalRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getStoredProposalRecords(): StoredProposalRecord[] {
  return readStorageRecords();
}

export function getStoredProposalById(id: string): StoredProposalRecord | undefined {
  return readStorageRecords().find((record) => record.id === id);
}

export function saveProposalRecord(proposal: MockProposal, id?: string): StoredProposalRecord {
  const now = new Date().toISOString();
  const proposalId = id ?? proposal.id ?? crypto.randomUUID();
  const nextProposal: MockProposal = normalizeProposal({ ...proposal, id: proposalId });
  const records = readStorageRecords();
  const existingIndex = records.findIndex((record) => record.id === proposalId);
  const record: StoredProposalRecord = {
    id: proposalId,
    proposal: nextProposal,
    savedAt: existingIndex === -1 ? now : records[existingIndex]!.savedAt,
    updatedAt: now,
  };

  if (existingIndex === -1) {
    records.unshift(record);
  } else {
    records[existingIndex] = record;
  }

  writeStorageRecords(records);
  return record;
}

export function markProposalCompleted(id: string): StoredProposalRecord | undefined {
  const seed = SEED_PROPOSAL_RECORDS[id];
  if (seed) {
    const updated: MockProposal = { ...seed, status: "completed" };
    return saveProposalRecord(updated, id);
  }

  const stored = getStoredProposalById(id);
  if (!stored) return undefined;

  const updated: MockProposal = { ...stored.proposal, status: "completed" };
  return saveProposalRecord(updated, id);
}

export function getAllProposalListItems(): ProposalListItemDTO[] {
  const storedItems = readStorageRecords().map((record) =>
    toListItem(record.id, record.proposal, record.savedAt, record.updatedAt),
  );

  const storedIds = new Set(storedItems.map((item) => item.id));
  const seedItems = SEED_PROPOSAL_LIST.filter((item) => !storedIds.has(item.id));

  return [...storedItems, ...seedItems].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getProposalById(id: string): MockProposal | undefined {
  const stored = getStoredProposalById(id);
  if (stored) return normalizeProposal(stored.proposal);
  const seed = SEED_PROPOSAL_RECORDS[id];
  return seed ? normalizeProposal(seed) : undefined;
}

export function getProposalListItemById(id: string): ProposalListItemDTO | undefined {
  return getAllProposalListItems().find((item) => item.id === id);
}
