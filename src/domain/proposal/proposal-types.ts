export type ServiceCategory =
  | "Electrical"
  | "HVAC"
  | "Plumbing"
  | "Maintenance"
  | "Inspection";

export type ProposalStatusValue = "draft" | "completed";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Electrical",
  "HVAC",
  "Plumbing",
  "Maintenance",
  "Inspection",
];

export interface ProposalService {
  id: string;
  title: string;
  description: string;
  image: string;
  category: ServiceCategory;
  price: number;
}

export interface ProposalTemplateScheduleEntry {
  period: string;
  activity: string;
  notes: string;
}

export interface ProposalTemplate {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  introduction: string;
  serviceIds: string[];
  schedule: ProposalTemplateScheduleEntry[];
}

export type LibraryTab = "services" | "templates";

export const MAX_SERVICE_IMAGES = 3;

export interface ProposalLineItem {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  images: string[];
  qty: number;
  unitPrice: number;
}

export type ProposalBlock =
  | { id: string; type: "text"; content: string }
  | { id: string; type: "heading"; content: string }
  | { id: string; type: "divider" }
  | { id: string; type: "image"; alt: string }
  | { id: string; type: "schedule"; items: ProposalScheduleItem[] };

export interface ProposalCover {
  title: string;
  client: string;
  clientAddress?: string;
  clientDocument?: string;
  clientContact?: string;
  customerId?: string;
  number: string;
  date: string;
}

export interface ProposalSignature {
  preparedBy: string;
  date: string;
}

export interface ProposalFinancial {
  discountPercent: number;
  taxPercent: number;
}

export interface ProposalScheduleItem {
  id: string;
  period: string;
  activity: string;
  notes: string;
}

export interface ProposalInternalCostItem {
  id: string;
  description: string;
  amount: number;
}

export interface ProposalDocument {
  id?: string;
  status: ProposalStatusValue;
  cover: ProposalCover;
  introduction: string;
  lineItems: ProposalLineItem[];
  blocks: ProposalBlock[];
  sectionOrder?: string[];
  schedule: ProposalScheduleItem[];
  notes: string;
  signature: ProposalSignature;
  financial: ProposalFinancial;
  internalCosts: ProposalInternalCostItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProposalDetailDTO {
  listItem: ProposalListItemDTO;
  proposal: ProposalDocument;
}

/** Shape consumida pela UI do builder e retornada pela API. */
export type ProposalDocumentDTO = ProposalDocument;

export interface ProposalFinancialSummary {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  grandTotal: number;
}

export type ProposalZoom = 75 | 100 | 125;

export interface ProposalBuilderState {
  proposal: ProposalDocument;
  zoom: ProposalZoom;
  librarySearch: string;
  libraryCategory: ServiceCategory | "All";
  libraryTab: LibraryTab;
  isLibraryOpen: boolean;
  toast: { message: string; id: number } | null;
}

export type DragSource = "library" | "document";

export interface ActiveDragItem {
  source: DragSource | "document-section";
  service?: ProposalService;
  lineItem?: ProposalLineItem;
  block?: ProposalBlock;
  sectionLabel?: string;
}

export interface ProposalListItemDTO {
  id: string;
  number: string;
  title: string;
  client: string;
  status: ProposalStatusValue;
  serviceCount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalListResponseDTO {
  items: ProposalListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

