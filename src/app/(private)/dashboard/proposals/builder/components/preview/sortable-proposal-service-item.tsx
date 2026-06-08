"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

import type { ProposalLineItem } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "../proposal-builder-provider";
import { InlineEditableField } from "./inline-editable-field";

interface Props {
  item: ProposalLineItem;
}

export function SortableProposalServiceItem({ item }: Props): React.ReactElement {
  const { updateLineItem, removeLineItem } = useProposalBuilder();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `doc-${item.id}`,
    data: { source: "document", lineItem: item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-[0.625rem] border border-zinc-200 bg-white transition-shadow duration-200",
        isDragging && "z-10 shadow-xl ring-2 ring-[var(--builder-accent)]/30",
      )}
    >
      <button
        type="button"
        data-builder-chrome
        onClick={() => removeLineItem(item.id)}
        className="absolute right-[0.5rem] top-[0.5rem] z-10 flex size-[1.5rem] items-center justify-center rounded-full bg-white/90 text-zinc-400 opacity-0 shadow-sm transition-all hover:text-red-500 group-hover:opacity-100"
        aria-label="Remover serviço"
      >
        <X className="size-[0.875rem]" />
      </button>

      <div className="flex gap-[0.75rem]">
        <button
          type="button"
          data-builder-chrome
          className="flex shrink-0 cursor-grab items-center self-stretch border-r border-zinc-100 px-[0.375rem] text-zinc-300 hover:text-zinc-500"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="size-[1rem]" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
          <div className="aspect-video w-full shrink-0 overflow-hidden bg-zinc-100 sm:w-[8rem] sm:aspect-auto sm:min-h-[5.5rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              crossOrigin="anonymous"
              className="size-full object-cover"
              draggable={false}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[0.375rem] p-[0.75rem]">
            <InlineEditableField
              value={item.title}
              onChange={(title) => updateLineItem(item.id, { title })}
              className="text-[0.9375rem] font-semibold leading-[1.25rem] text-zinc-900"
              placeholder="Título do serviço"
            />
            <InlineEditableField
              value={item.description}
              onChange={(description) => updateLineItem(item.id, { description })}
              multiline
              className="text-[0.8125rem] leading-[1.375rem] text-zinc-600"
              placeholder="Descrição do serviço"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
