"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  fromSortableSectionId,
  isDocumentSectionSortableId,
} from "@/domain/proposal/proposal-section-order";
import type { ActiveDragItem, ProposalService, ProposalBlock } from "@/domain/proposal/proposal-types";

import { DesktopOnlyGuard } from "./desktop-only-guard";
import { useMediaQuery } from "./hooks/use-media-query";
import { FloatingToolbar } from "./preview/floating-toolbar";
import { ProposalBuilderHeader } from "./proposal-builder-header";
import {
  ProposalBuilderProvider,
  useProposalBuilder,
} from "./proposal-builder-provider";
import { ProposalBuilderWorkspace } from "./proposal-builder-workspace";
import { ServiceCardPreview } from "./services-library/draggable-service-card";
import { BuilderToast } from "./ui/builder-toast";

export function ProposalBuilder(): React.ReactElement {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id") ?? undefined;

  return (
    <ProposalBuilderProvider proposalId={proposalId}>
      <DesktopOnlyGuard>
        <ProposalBuilderContent />
      </DesktopOnlyGuard>
    </ProposalBuilderProvider>
  );
}

function blockDragLabel(type: ProposalBlock["type"]): string {
  switch (type) {
    case "heading":
      return "Título";
    case "text":
      return "Texto";
    case "divider":
      return "Divisor";
    case "image":
      return "Imagem";
    case "schedule":
      return "Cronograma";
    default:
      return "Seção";
  }
}

function ProposalBuilderContent(): React.ReactElement {
  const isWideDesktop = useMediaQuery("(min-width: 1440px)");
  const isMediumDesktop = useMediaQuery("(min-width: 1024px)");
  const { toggleLibrary, addLineItem, reorderLineItems, reorderSections } = useProposalBuilder();
  const [activeDrag, setActiveDrag] = useState<ActiveDragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as
      | { source: "library"; service: ProposalService }
      | {
          source: "document";
          lineItem: ActiveDragItem["lineItem"];
        }
      | {
          source: "document-section";
          sectionKey: string;
          sectionLabel: string;
          block?: ProposalBlock;
        }
      | undefined;

    if (!data) return;

    if (data.source === "library") {
      setActiveDrag({ source: "library", service: data.service });
    } else if (data.source === "document" && data.lineItem) {
      setActiveDrag({ source: "document", lineItem: data.lineItem });
    } else if (data.source === "document-section") {
      setActiveDrag({
        source: "document-section",
        block: data.block,
        sectionLabel: data.sectionLabel,
      });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeData = active.data.current as
        | { source: "library"; service: ProposalService }
        | { source: "document"; lineItem: { id: string } }
        | { source: "document-section"; sectionKey: string; block?: ProposalBlock }
        | undefined;

      if (activeData?.source === "library") {
        if (overId === "services-drop-zone" || overId.startsWith("doc-")) {
          addLineItem(activeData.service);
        }
        return;
      }

      if (activeData?.source === "document" && overId.startsWith("doc-")) {
        const activeLineId = activeId.replace("doc-", "");
        const overLineId = overId.replace("doc-", "");
        if (activeLineId !== overLineId) {
          reorderLineItems(activeLineId, overLineId);
        }
        return;
      }

      if (
        activeData?.source === "document-section" &&
        isDocumentSectionSortableId(overId)
      ) {
        const activeKey = fromSortableSectionId(activeId);
        const overKey = fromSortableSectionId(overId);
        if (activeKey !== overKey) {
          reorderSections(activeKey, overKey);
        }
      }
    },
    [addLineItem, reorderLineItems, reorderSections],
  );

  return (
    <>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <ProposalBuilderHeader
          showLibraryToggle={isMediumDesktop && !isWideDesktop}
          onToggleLibrary={toggleLibrary}
        />
        <div className="z-20 flex shrink-0 justify-center border-b border-zinc-200/60 bg-zinc-100/80 px-[1rem] py-[0.75rem] backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/80">
          <FloatingToolbar />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <ProposalBuilderWorkspace
              isWideDesktop={isWideDesktop}
              isMediumDesktop={isMediumDesktop}
            />
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeDrag?.source === "library" && activeDrag.service ? (
              <ServiceCardPreview service={activeDrag.service} />
            ) : null}
            {activeDrag?.source === "document" && activeDrag.lineItem ? (
              <div className="rounded-[0.625rem] border border-zinc-200 bg-white p-[0.75rem] shadow-xl">
                <p className="text-[0.875rem] font-semibold">{activeDrag.lineItem.title}</p>
              </div>
            ) : null}
            {activeDrag?.source === "document-section" ? (
              <div className="rounded-[0.625rem] border border-zinc-200 bg-white px-[0.875rem] py-[0.625rem] shadow-xl">
                <p className="text-[0.8125rem] font-medium text-zinc-700">
                  {activeDrag.sectionLabel ??
                    (activeDrag.block ? blockDragLabel(activeDrag.block.type) : "Seção")}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <BuilderToast />
      </div>
    </>
  );
}
