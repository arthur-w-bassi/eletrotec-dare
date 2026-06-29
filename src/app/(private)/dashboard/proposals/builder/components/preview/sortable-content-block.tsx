"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

import type { ProposalBlock } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "../proposal-builder-provider";
import { InlineEditableField } from "./inline-editable-field";
import { ScheduleBlockContent } from "./schedule-block-content";

interface Props {
  block: ProposalBlock;
}

function BlockPreview({ block }: { block: ProposalBlock }): React.ReactElement {
  const { updateBlockContent } = useProposalBuilder();

  switch (block.type) {
    case "text":
      return (
        <InlineEditableField
          value={block.content}
          onChange={(content) => updateBlockContent(block.id, content)}
          multiline
          className="min-w-0 flex-1 text-[0.875rem] leading-[1.5rem] text-zinc-700"
          placeholder="Escreva o texto..."
        />
      );
    case "heading":
      return (
        <InlineEditableField
          value={block.content}
          onChange={(content) => updateBlockContent(block.id, content)}
          className="min-w-0 flex-1 text-[1.125rem] font-semibold text-zinc-900"
          placeholder="Título da seção"
        />
      );
    case "divider":
      return <hr className="min-w-0 flex-1 border-zinc-200" />;
    case "image":
      return (
        <div className="flex min-w-0 flex-1 aspect-video items-center justify-center rounded-[0.625rem] border border-dashed border-zinc-300 bg-zinc-50 text-[0.8125rem] text-zinc-400">
          {block.alt}
        </div>
      );
    case "schedule":
      return (
        <div className="min-w-0 flex-1">
          <ScheduleBlockContent block={block} />
        </div>
      );
    default:
      return <div />;
  }
}

function blockTypeLabel(type: ProposalBlock["type"]): string {
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

export function SortableContentBlock({ block }: Props): React.ReactElement {
  const { removeBlock } = useProposalBuilder();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `block-${block.id}`,
    data: {
      source: "document-section",
      sectionKey: `block:${block.id}`,
      sectionLabel: blockTypeLabel(block.type),
      block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex gap-[0.375rem] rounded-[0.625rem] border border-transparent transition-all duration-200",
        isDragging && "z-10 border-[var(--builder-accent)] bg-white shadow-xl ring-2 ring-[var(--builder-accent)]/30",
        !isDragging && "hover:border-zinc-200 hover:bg-zinc-50/50",
      )}
    >
      <button
        type="button"
        data-builder-chrome
        className="mt-[0.375rem] flex shrink-0 cursor-grab items-start self-stretch rounded-[0.375rem] px-[0.25rem] text-zinc-300 opacity-0 transition-opacity hover:text-zinc-500 group-hover:opacity-100"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar ${blockTypeLabel(block.type).toLowerCase()}`}
      >
        <GripVertical className="size-[1rem]" />
      </button>

      <div className={cn("min-w-0 flex-1 py-[0.375rem] pr-[2rem]", block.type === "schedule" && "pr-[0.5rem]")}>
        <BlockPreview block={block} />
      </div>

      <button
        type="button"
        data-builder-chrome
        onClick={() => removeBlock(block.id)}
        className="absolute right-[0.375rem] top-[0.375rem] flex size-[1.5rem] items-center justify-center rounded-[0.375rem] text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        aria-label={`Remover ${blockTypeLabel(block.type).toLowerCase()}`}
      >
        <X className="size-[0.875rem]" />
      </button>
    </div>
  );
}
