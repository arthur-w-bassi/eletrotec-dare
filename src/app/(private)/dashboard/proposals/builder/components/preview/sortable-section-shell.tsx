"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/helpers/cn";

interface Props {
  sortableId: string;
  sectionKey: string;
  sectionLabel: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableSectionShell({
  sortableId,
  sectionKey,
  sectionLabel,
  children,
  className,
}: Props): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { source: "document-section", sectionKey, sectionLabel },
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
        className,
      )}
    >
      <button
        type="button"
        data-builder-chrome
        className="mt-[0.375rem] flex shrink-0 cursor-grab items-start self-stretch rounded-[0.375rem] px-[0.25rem] text-zinc-300 opacity-0 transition-opacity hover:text-zinc-500 group-hover:opacity-100"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar seção ${sectionLabel.toLowerCase()}`}
      >
        <GripVertical className="size-[1rem]" />
      </button>

      <div className="min-w-0 flex-1 py-[0.375rem]">{children}</div>
    </div>
  );
}
