"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";

import type { CustomerDTO } from "@/domain/customer/customer-types";
import { mapCustomerToCoverFields } from "@/domain/proposal/proposal-customer";
import {
  buildProposalFromTemplate,
  createBlankProposal,
  createInternalCostItem,
  createLineItemFromService,
  createScheduleItem,
} from "@/domain/proposal/proposal-mock-data";
import { normalizeProposal } from "@/domain/proposal/proposal-normalize";
import {
  blockSectionKey,
  normalizeSectionOrder,
} from "@/domain/proposal/proposal-section-order";
import {
  buildProposalPdfFilename,
  captureElementAsPdfBlob,
  downloadPdfBlob,
  openPdfBlobInNewTab,
} from "@/domain/proposal/proposal-pdf";
import {
  getAllProposalListItems,
  getProposalById,
  saveProposalRecord,
} from "@/domain/proposal/proposal-storage";
import type {
  LibraryTab,
  MockProposal,
  MockService,
  ProposalBlock,
  ProposalBuilderState,
  ProposalCover,
  ProposalInternalCostItem,
  ProposalScheduleItem,
  ProposalTemplate,
  ProposalZoom,
  ServiceCategory,
} from "@/domain/proposal/proposal-types";
import { queryKeys } from "@/infra/queryKey/query-key";

const MAX_HISTORY = 50;

interface HistoryState {
  past: MockProposal[];
  present: MockProposal;
  future: MockProposal[];
}

interface UiState {
  zoom: ProposalZoom;
  librarySearch: string;
  libraryCategory: ServiceCategory | "All";
  libraryTab: LibraryTab;
  isLibraryOpen: boolean;
  isLibraryLoading: boolean;
  toast: { message: string; id: number } | null;
}

interface FullState {
  history: HistoryState;
  ui: UiState;
}

type HistoryAction =
  | { type: "SET_PROPOSAL"; proposal: MockProposal; recordHistory?: boolean }
  | { type: "ADD_LINE_ITEM"; service: MockService }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "REORDER_LINE_ITEMS"; activeId: string; overId: string }
  | {
      type: "UPDATE_LINE_ITEM";
      id: string;
      updates: Partial<
        Pick<
          MockProposal["lineItems"][number],
          "title" | "description" | "qty" | "unitPrice" | "images"
        >
      >;
    }
  | { type: "UPDATE_FINANCIAL"; updates: Partial<MockProposal["financial"]> }
  | { type: "UPDATE_COVER"; updates: Partial<ProposalCover> }
  | { type: "APPLY_CUSTOMER_TO_COVER"; customer: CustomerDTO }
  | { type: "UPDATE_INTRODUCTION"; introduction: string }
  | { type: "UPDATE_NOTES"; notes: string }
  | { type: "ADD_SCHEDULE_ITEM"; blockId: string; item?: ProposalScheduleItem }
  | { type: "REMOVE_SCHEDULE_ITEM"; blockId: string; id: string }
  | {
      type: "UPDATE_SCHEDULE_ITEM";
      blockId: string;
      id: string;
      updates: Partial<Pick<ProposalScheduleItem, "period" | "activity" | "notes">>;
    }
  | { type: "ADD_INTERNAL_COST"; item?: ProposalInternalCostItem }
  | { type: "REMOVE_INTERNAL_COST"; id: string }
  | {
      type: "UPDATE_INTERNAL_COST";
      id: string;
      updates: Partial<Pick<ProposalInternalCostItem, "description" | "amount">>;
    }
  | { type: "ADD_BLOCK"; block: ProposalBlock }
  | { type: "UPDATE_BLOCK_CONTENT"; id: string; content: string }
  | { type: "REMOVE_BLOCK"; id: string }
  | { type: "REORDER_SECTIONS"; activeKey: string; overKey: string }
  | { type: "APPLY_TEMPLATE"; template: ProposalTemplate }
  | { type: "UNDO" }
  | { type: "REDO" };

type UiAction =
  | { type: "SET_ZOOM"; zoom: ProposalZoom }
  | { type: "SET_LIBRARY_SEARCH"; search: string }
  | { type: "SET_LIBRARY_CATEGORY"; category: ServiceCategory | "All" }
  | { type: "SET_LIBRARY_TAB"; tab: LibraryTab }
  | { type: "TOGGLE_LIBRARY" }
  | { type: "SET_LIBRARY_OPEN"; open: boolean }
  | { type: "SET_LIBRARY_LOADING"; loading: boolean }
  | { type: "SHOW_TOAST"; message: string }
  | { type: "DISMISS_TOAST" };

type Action = HistoryAction | UiAction;

function pushHistory(state: HistoryState, next: MockProposal): HistoryState {
  const past = [...state.past, state.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [] };
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "SET_PROPOSAL":
      if (action.recordHistory === false) {
        return { ...state, present: normalizeProposal(action.proposal) };
      }
      return pushHistory(state, normalizeProposal(action.proposal));

    case "ADD_LINE_ITEM": {
      const lineItem = createLineItemFromService(action.service);
      return pushHistory(state, {
        ...state.present,
        lineItems: [...state.present.lineItems, lineItem],
      });
    }

    case "REMOVE_LINE_ITEM":
      return pushHistory(state, {
        ...state.present,
        lineItems: state.present.lineItems.filter((item) => item.id !== action.id),
      });

    case "REORDER_LINE_ITEMS": {
      const items = [...state.present.lineItems];
      const oldIndex = items.findIndex((item) => item.id === action.activeId);
      const newIndex = items.findIndex((item) => item.id === action.overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;

      const [moved] = items.splice(oldIndex, 1);
      if (!moved) return state;
      items.splice(newIndex, 0, moved);

      return pushHistory(state, { ...state.present, lineItems: items });
    }

    case "UPDATE_LINE_ITEM":
      return pushHistory(state, {
        ...state.present,
        lineItems: state.present.lineItems.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item,
        ),
      });

    case "UPDATE_FINANCIAL":
      return pushHistory(state, {
        ...state.present,
        financial: { ...state.present.financial, ...action.updates },
      });

    case "UPDATE_COVER":
      return pushHistory(state, {
        ...state.present,
        cover: { ...state.present.cover, ...action.updates },
      });

    case "APPLY_CUSTOMER_TO_COVER":
      return pushHistory(state, {
        ...state.present,
        cover: { ...state.present.cover, ...mapCustomerToCoverFields(action.customer) },
      });

    case "UPDATE_INTRODUCTION":
      return pushHistory(state, { ...state.present, introduction: action.introduction });

    case "UPDATE_NOTES":
      return pushHistory(state, { ...state.present, notes: action.notes });

    case "ADD_SCHEDULE_ITEM": {
      const blocks = (state.present.blocks ?? []).map((block) => {
        if (block.id !== action.blockId || block.type !== "schedule") return block;
        return {
          ...block,
          items: [...block.items, action.item ?? createScheduleItem()],
        };
      });

      return pushHistory(state, { ...state.present, blocks });
    }

    case "REMOVE_SCHEDULE_ITEM": {
      const blocks = (state.present.blocks ?? []).map((block) => {
        if (block.id !== action.blockId || block.type !== "schedule") return block;
        return {
          ...block,
          items: block.items.filter((item) => item.id !== action.id),
        };
      });

      return pushHistory(state, { ...state.present, blocks });
    }

    case "UPDATE_SCHEDULE_ITEM": {
      const blocks = (state.present.blocks ?? []).map((block) => {
        if (block.id !== action.blockId || block.type !== "schedule") return block;
        return {
          ...block,
          items: block.items.map((item) =>
            item.id === action.id ? { ...item, ...action.updates } : item,
          ),
        };
      });

      return pushHistory(state, { ...state.present, blocks });
    }

    case "ADD_INTERNAL_COST":
      return pushHistory(state, {
        ...state.present,
        internalCosts: [
          ...(state.present.internalCosts ?? []),
          action.item ?? createInternalCostItem(),
        ],
      });

    case "REMOVE_INTERNAL_COST":
      return pushHistory(state, {
        ...state.present,
        internalCosts: (state.present.internalCosts ?? []).filter((item) => item.id !== action.id),
      });

    case "UPDATE_INTERNAL_COST":
      return pushHistory(state, {
        ...state.present,
        internalCosts: (state.present.internalCosts ?? []).map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item,
        ),
      });

    case "ADD_BLOCK": {
      const blocks = [...(state.present.blocks ?? []), action.block];
      const sectionOrder = [
        ...normalizeSectionOrder(state.present),
        blockSectionKey(action.block.id),
      ];

      return pushHistory(state, { ...state.present, blocks, sectionOrder });
    }

    case "UPDATE_BLOCK_CONTENT": {
      const blocks = (state.present.blocks ?? []).map((block) => {
        if (block.id !== action.id) return block;
        if (block.type !== "text" && block.type !== "heading") return block;
        return { ...block, content: action.content };
      });

      return pushHistory(state, { ...state.present, blocks });
    }

    case "REMOVE_BLOCK": {
      const blocks = (state.present.blocks ?? []).filter((block) => block.id !== action.id);
      const sectionOrder = normalizeSectionOrder(state.present).filter(
        (key) => key !== blockSectionKey(action.id),
      );

      return pushHistory(state, { ...state.present, blocks, sectionOrder });
    }

    case "REORDER_SECTIONS": {
      const order = [...normalizeSectionOrder(state.present)];
      const oldIndex = order.indexOf(action.activeKey);
      const newIndex = order.indexOf(action.overKey);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;

      const [moved] = order.splice(oldIndex, 1);
      if (!moved) return state;
      order.splice(newIndex, 0, moved);

      return pushHistory(state, { ...state.present, sectionOrder: order });
    }

    case "APPLY_TEMPLATE":
      return pushHistory(state, buildProposalFromTemplate(action.template, state.present));

    case "UNDO":
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: normalizeProposal(state.past[state.past.length - 1]!),
        future: [state.present, ...state.future],
      };

    case "REDO":
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: normalizeProposal(state.future[0]!),
        future: state.future.slice(1),
      };

    default:
      return state;
  }
}

function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };
    case "SET_LIBRARY_SEARCH":
      return { ...state, librarySearch: action.search };
    case "SET_LIBRARY_CATEGORY":
      return { ...state, libraryCategory: action.category };
    case "SET_LIBRARY_TAB":
      return { ...state, libraryTab: action.tab };
    case "TOGGLE_LIBRARY":
      return { ...state, isLibraryOpen: !state.isLibraryOpen };
    case "SET_LIBRARY_OPEN":
      return { ...state, isLibraryOpen: action.open };
    case "SET_LIBRARY_LOADING":
      return { ...state, isLibraryLoading: action.loading };
    case "SHOW_TOAST":
      return { ...state, toast: { message: action.message, id: Date.now() } };
    case "DISMISS_TOAST":
      return { ...state, toast: null };
    default:
      return state;
  }
}

function reducer(state: FullState, action: Action): FullState {
  if (
    action.type === "SET_ZOOM" ||
    action.type === "SET_LIBRARY_SEARCH" ||
    action.type === "SET_LIBRARY_CATEGORY" ||
    action.type === "SET_LIBRARY_TAB" ||
    action.type === "TOGGLE_LIBRARY" ||
    action.type === "SET_LIBRARY_OPEN" ||
    action.type === "SET_LIBRARY_LOADING" ||
    action.type === "SHOW_TOAST" ||
    action.type === "DISMISS_TOAST"
  ) {
    return { ...state, ui: uiReducer(state.ui, action) };
  }

  return { ...state, history: historyReducer(state.history, action) };
}

interface ProposalBuilderContextValue {
  proposal: MockProposal;
  isNewProposal: boolean;
  zoom: ProposalZoom;
  librarySearch: string;
  libraryCategory: ServiceCategory | "All";
  libraryTab: LibraryTab;
  isLibraryOpen: boolean;
  isLibraryLoading: boolean;
  toast: UiState["toast"];
  canUndo: boolean;
  canRedo: boolean;
  addLineItem: (service: MockService) => void;
  removeLineItem: (id: string) => void;
  reorderLineItems: (activeId: string, overId: string) => void;
  updateLineItem: (
    id: string,
    updates: Partial<
      Pick<
        MockProposal["lineItems"][number],
        "title" | "description" | "qty" | "unitPrice" | "images"
      >
    >,
  ) => void;
  updateFinancial: (updates: Partial<MockProposal["financial"]>) => void;
  updateCover: (updates: Partial<ProposalCover>) => void;
  applyCustomerToCover: (customer: CustomerDTO) => void;
  updateIntroduction: (introduction: string) => void;
  updateNotes: (notes: string) => void;
  addScheduleItem: (blockId: string) => void;
  removeScheduleItem: (blockId: string, id: string) => void;
  updateScheduleItem: (
    blockId: string,
    id: string,
    updates: Partial<Pick<ProposalScheduleItem, "period" | "activity" | "notes">>,
  ) => void;
  addInternalCost: () => void;
  removeInternalCost: (id: string) => void;
  updateInternalCost: (
    id: string,
    updates: Partial<Pick<ProposalInternalCostItem, "description" | "amount">>,
  ) => void;
  addBlock: (block: ProposalBlock) => void;
  updateBlockContent: (id: string, content: string) => void;
  removeBlock: (id: string) => void;
  reorderSections: (activeKey: string, overKey: string) => void;
  applyTemplate: (template: ProposalTemplate) => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: ProposalZoom) => void;
  setLibrarySearch: (search: string) => void;
  setLibraryCategory: (category: ServiceCategory | "All") => void;
  setLibraryTab: (tab: LibraryTab) => void;
  toggleLibrary: () => void;
  setLibraryOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  saveDraft: () => void;
  generatePdf: () => Promise<void>;
  previewPdf: () => Promise<void>;
  registerDocumentElement: (element: HTMLElement | null) => void;
  isPdfGenerating: boolean;
}

const ProposalBuilderContext = createContext<ProposalBuilderContextValue | null>(null);

function resolveInitialProposal(proposalId?: string): MockProposal {
  if (proposalId) {
    const loaded = getProposalById(proposalId);
    if (loaded) return normalizeProposal(loaded);
  }

  const existingNumbers = getAllProposalListItems().map((item) => item.number);
  return normalizeProposal(createBlankProposal(existingNumbers));
}

function createInitialState(proposalId?: string): FullState {
  return {
    history: {
      past: [],
      present: resolveInitialProposal(proposalId),
      future: [],
    },
    ui: {
      zoom: 100,
      librarySearch: "",
      libraryCategory: "All",
      libraryTab: "services",
      isLibraryOpen: false,
      isLibraryLoading: true,
      toast: null,
    },
  };
}

export function ProposalBuilderProvider({
  children,
  proposalId,
}: Readonly<{ children: React.ReactNode; proposalId?: string }>): React.ReactElement {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, proposalId, createInitialState);
  const documentElementRef = useRef<HTMLElement | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const registerDocumentElement = useCallback((element: HTMLElement | null) => {
    documentElementRef.current = element;
  }, []);

  useEffect(() => {
    if (!proposalId) return;
    const loaded = getProposalById(proposalId);
    if (loaded) {
      dispatch({ type: "SET_PROPOSAL", proposal: normalizeProposal(loaded), recordHistory: false });
    }
  }, [proposalId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch({ type: "SET_LIBRARY_LOADING", loading: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!state.ui.toast) return;
    const timer = window.setTimeout(() => dispatch({ type: "DISMISS_TOAST" }), 3000);
    return () => window.clearTimeout(timer);
  }, [state.ui.toast]);

  const addLineItem = useCallback((service: MockService) => {
    dispatch({ type: "ADD_LINE_ITEM", service });
  }, []);

  const removeLineItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_LINE_ITEM", id });
  }, []);

  const reorderLineItems = useCallback((activeId: string, overId: string) => {
    dispatch({ type: "REORDER_LINE_ITEMS", activeId, overId });
  }, []);

  const updateLineItem = useCallback(
    (
      id: string,
      updates: Partial<
        Pick<
        MockProposal["lineItems"][number],
        "title" | "description" | "qty" | "unitPrice" | "images"
      >
      >,
    ) => {
      dispatch({ type: "UPDATE_LINE_ITEM", id, updates });
    },
    [],
  );

  const updateFinancial = useCallback((updates: Partial<MockProposal["financial"]>) => {
    dispatch({ type: "UPDATE_FINANCIAL", updates });
  }, []);

  const updateCover = useCallback((updates: Partial<ProposalCover>) => {
    dispatch({ type: "UPDATE_COVER", updates });
  }, []);

  const applyCustomerToCover = useCallback((customer: CustomerDTO) => {
    dispatch({ type: "APPLY_CUSTOMER_TO_COVER", customer });
  }, []);

  const updateIntroduction = useCallback((introduction: string) => {
    dispatch({ type: "UPDATE_INTRODUCTION", introduction });
  }, []);

  const updateNotes = useCallback((notes: string) => {
    dispatch({ type: "UPDATE_NOTES", notes });
  }, []);

  const addScheduleItem = useCallback((blockId: string) => {
    dispatch({ type: "ADD_SCHEDULE_ITEM", blockId });
  }, []);

  const removeScheduleItem = useCallback((blockId: string, id: string) => {
    dispatch({ type: "REMOVE_SCHEDULE_ITEM", blockId, id });
  }, []);

  const updateScheduleItem = useCallback(
    (
      blockId: string,
      id: string,
      updates: Partial<Pick<ProposalScheduleItem, "period" | "activity" | "notes">>,
    ) => {
      dispatch({ type: "UPDATE_SCHEDULE_ITEM", blockId, id, updates });
    },
    [],
  );

  const addInternalCost = useCallback(() => {
    dispatch({ type: "ADD_INTERNAL_COST" });
  }, []);

  const removeInternalCost = useCallback((id: string) => {
    dispatch({ type: "REMOVE_INTERNAL_COST", id });
  }, []);

  const updateInternalCost = useCallback(
    (
      id: string,
      updates: Partial<Pick<ProposalInternalCostItem, "description" | "amount">>,
    ) => {
      dispatch({ type: "UPDATE_INTERNAL_COST", id, updates });
    },
    [],
  );

  const addBlock = useCallback((block: ProposalBlock) => {
    dispatch({ type: "ADD_BLOCK", block });
  }, []);

  const updateBlockContent = useCallback((id: string, content: string) => {
    dispatch({ type: "UPDATE_BLOCK_CONTENT", id, content });
  }, []);

  const removeBlock = useCallback((id: string) => {
    dispatch({ type: "REMOVE_BLOCK", id });
  }, []);

  const reorderSections = useCallback((activeKey: string, overKey: string) => {
    dispatch({ type: "REORDER_SECTIONS", activeKey, overKey });
  }, []);

  const applyTemplate = useCallback(
    (template: ProposalTemplate) => {
      dispatch({ type: "APPLY_TEMPLATE", template });
    },
    [],
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const setZoom = useCallback((zoom: ProposalZoom) => {
    dispatch({ type: "SET_ZOOM", zoom });
  }, []);

  const setLibrarySearch = useCallback((search: string) => {
    dispatch({ type: "SET_LIBRARY_SEARCH", search });
  }, []);

  const setLibraryCategory = useCallback((category: ServiceCategory | "All") => {
    dispatch({ type: "SET_LIBRARY_CATEGORY", category });
  }, []);

  const setLibraryTab = useCallback((tab: LibraryTab) => {
    dispatch({ type: "SET_LIBRARY_TAB", tab });
  }, []);

  const toggleLibrary = useCallback(() => dispatch({ type: "TOGGLE_LIBRARY" }), []);
  const setLibraryOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_LIBRARY_OPEN", open });
  }, []);

  const showToast = useCallback((message: string) => {
    dispatch({ type: "SHOW_TOAST", message });
  }, []);

  const dismissToast = useCallback(() => dispatch({ type: "DISMISS_TOAST" }), []);

  const saveDraft = useCallback(() => {
    const record = saveProposalRecord(
      state.history.present,
      proposalId ?? state.history.present.id,
    );
    dispatch({ type: "SET_PROPOSAL", proposal: record.proposal, recordHistory: false });
    void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    showToast("Rascunho salvo localmente");
  }, [proposalId, queryClient, showToast, state.history.present]);

  const captureProposalPdf = useCallback(async (): Promise<Blob> => {
    const element = documentElementRef.current;
    if (!element) {
      throw new Error("document_not_found");
    }

    return captureElementAsPdfBlob(element);
  }, []);

  const generatePdf = useCallback(async () => {
    if (isPdfGenerating) return;

    setIsPdfGenerating(true);
    try {
      const blob = await captureProposalPdf();
      const filename = buildProposalPdfFilename(state.history.present.cover);
      downloadPdfBlob(blob, filename);

      const currentId = proposalId ?? state.history.present.id ?? crypto.randomUUID();
      const completed: MockProposal = {
        ...state.history.present,
        id: currentId,
        status: "completed",
      };
      const record = saveProposalRecord(completed, currentId);
      dispatch({ type: "SET_PROPOSAL", proposal: record.proposal, recordHistory: false });
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
      showToast("PDF gerado e proposta marcada como concluída");
    } catch (error) {
      if (error instanceof Error && error.message === "document_not_found") {
        showToast("Não foi possível localizar o preview da proposta");
        return;
      }

      showToast("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setIsPdfGenerating(false);
    }
  }, [
    captureProposalPdf,
    isPdfGenerating,
    proposalId,
    queryClient,
    showToast,
    state.history.present,
  ]);

  const previewPdf = useCallback(async () => {
    if (isPdfGenerating) return;

    setIsPdfGenerating(true);
    try {
      const blob = await captureProposalPdf();
      openPdfBlobInNewTab(blob);
      showToast("PDF aberto numa nova aba");
    } catch (error) {
      if (error instanceof Error && error.message === "document_not_found") {
        showToast("Não foi possível localizar o preview da proposta");
        return;
      }

      showToast("Não foi possível visualizar o PDF. Tente novamente.");
    } finally {
      setIsPdfGenerating(false);
    }
  }, [captureProposalPdf, isPdfGenerating, showToast]);

  const isNewProposal = proposalId === undefined;

  const value = useMemo<ProposalBuilderContextValue>(
    () => ({
      proposal: state.history.present,
      isNewProposal,
      zoom: state.ui.zoom,
      librarySearch: state.ui.librarySearch,
      libraryCategory: state.ui.libraryCategory,
      libraryTab: state.ui.libraryTab,
      isLibraryOpen: state.ui.isLibraryOpen,
      isLibraryLoading: state.ui.isLibraryLoading,
      toast: state.ui.toast,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      addLineItem,
      removeLineItem,
      reorderLineItems,
      updateLineItem,
      updateFinancial,
      updateCover,
      applyCustomerToCover,
      updateIntroduction,
      updateNotes,
      addScheduleItem,
      removeScheduleItem,
      updateScheduleItem,
      addInternalCost,
      removeInternalCost,
      updateInternalCost,
      addBlock,
      updateBlockContent,
      removeBlock,
      reorderSections,
      applyTemplate,
      undo,
      redo,
      setZoom,
      setLibrarySearch,
      setLibraryCategory,
      setLibraryTab,
      toggleLibrary,
      setLibraryOpen,
      showToast,
      dismissToast,
      saveDraft,
      generatePdf,
      previewPdf,
      registerDocumentElement,
      isPdfGenerating,
    }),
    [state, isNewProposal, addLineItem, removeLineItem, reorderLineItems, updateLineItem, updateFinancial, updateCover, applyCustomerToCover, updateIntroduction, updateNotes, addScheduleItem, removeScheduleItem, updateScheduleItem, addInternalCost, removeInternalCost, updateInternalCost, addBlock, updateBlockContent, removeBlock, reorderSections, applyTemplate, undo, redo, setZoom, setLibrarySearch, setLibraryCategory, setLibraryTab, toggleLibrary, setLibraryOpen, showToast, dismissToast, saveDraft, generatePdf, previewPdf, registerDocumentElement, isPdfGenerating],
  );

  return (
    <ProposalBuilderContext.Provider value={value}>{children}</ProposalBuilderContext.Provider>
  );
}

export function useProposalBuilder(): ProposalBuilderContextValue {
  const context = useContext(ProposalBuilderContext);
  if (!context) {
    throw new Error("useProposalBuilder must be used within ProposalBuilderProvider");
  }
  return context;
}

export type { ProposalBuilderState };
