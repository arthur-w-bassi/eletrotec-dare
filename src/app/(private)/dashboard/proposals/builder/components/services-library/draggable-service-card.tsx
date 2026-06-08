"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { MockService } from "@/domain/proposal/proposal-types";
import { getCategoryLabel } from "@/domain/proposal/proposal-labels";
import { cn } from "@/helpers/cn";

interface Props {
  service: MockService;
  isOverlay?: boolean;
}

export function DraggableServiceCard({ service, isOverlay = false }: Props): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${service.id}`,
    data: { source: "library", service },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : { ...listeners, ...attributes })}
      className={cn(
        "cursor-grab overflow-hidden rounded-[0.625rem] border border-zinc-200 bg-zinc-50/80 transition-all duration-200 ease-out dark:border-zinc-700 dark:bg-zinc-900/50",
        "hover:-translate-y-px hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-600",
        isDragging && !isOverlay && "opacity-50",
        isOverlay && "rotate-1 shadow-xl",
      )}
    >
      <div className="aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      </div>
      <div className="flex flex-col gap-[0.375rem] p-[0.75rem]">
        <h3 className="text-[0.8125rem] font-semibold leading-[1.125rem] text-foreground">
          {service.title}
        </h3>
        <p className="line-clamp-2 text-[0.75rem] leading-[1.125rem] text-zinc-500">
          {service.description}
        </p>
        <span className="mt-[0.25rem] inline-flex w-fit rounded-full bg-zinc-100 px-[0.5rem] py-[0.125rem] text-[0.6875rem] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {getCategoryLabel(service.category)}
        </span>
      </div>
    </article>
  );
}

export function ServiceCardPreview({ service }: { service: MockService }): React.ReactElement {
  return <DraggableServiceCard service={service} isOverlay />;
}
