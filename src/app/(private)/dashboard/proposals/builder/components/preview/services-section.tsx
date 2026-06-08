"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { ProposalLineItem } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

import { ServicesEmptyState } from "./services-empty-state";
import { SortableProposalServiceItem } from "./sortable-proposal-service-item";

interface Props {
  lineItems: ProposalLineItem[];
}

export function ServicesSection({ lineItems }: Props): React.ReactElement {
  const { setNodeRef, isOver } = useDroppable({ id: "services-drop-zone" });

  return (
    <section>
      <h3 className="mb-[0.75rem] text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
        Serviços
      </h3>

      <div
        ref={setNodeRef}
        data-builder-dropzone
        className={cn(
          "min-h-[8rem] rounded-[0.625rem] border-2 border-dashed transition-all duration-200",
          lineItems.length === 0 ? "border-zinc-200 bg-zinc-50/50" : "border-transparent",
          isOver && "border-[var(--builder-accent)] bg-indigo-50/30",
        )}
      >
        {lineItems.length === 0 ? (
          <ServicesEmptyState />
        ) : (
          <SortableContext
            items={lineItems.map((item) => `doc-${item.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-[0.75rem]">
              {lineItems.map((item) => (
                <SortableProposalServiceItem key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </section>
  );
}
