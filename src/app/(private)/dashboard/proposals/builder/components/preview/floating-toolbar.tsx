"use client";

import {
  CalendarPlus,
  Heading,
  ImageIcon,
  Minus,
  Redo2,
  Text,
  Undo2,
} from "lucide-react";

import { createScheduleItem } from "@/domain/proposal/proposal-mock-data";
import type { ProposalBlock, ProposalZoom } from "@/domain/proposal/proposal-types";

import { useProposalBuilder } from "../proposal-builder-provider";
import { BuilderButton } from "../ui/builder-button";
import { BuilderSelect } from "../ui/builder-select";

function scrollToSection(sectionId: string): void {
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

export function FloatingToolbar(): React.ReactElement {
  const { canUndo, canRedo, undo, redo, addBlock, zoom, setZoom, showToast } =
    useProposalBuilder();

  function handleAddBlock(type: ProposalBlock["type"]): void {
    const id = crypto.randomUUID();
    switch (type) {
      case "text":
        addBlock({ id, type: "text", content: "Novo bloco de texto" });
        showToast("Bloco de texto adicionado");
        break;
      case "heading":
        addBlock({ id, type: "heading", content: "Novo título" });
        showToast("Título adicionado");
        break;
      case "divider":
        addBlock({ id, type: "divider" });
        showToast("Divisor adicionado");
        break;
      case "image":
        addBlock({ id, type: "image", alt: "Espaço reservado para imagem" });
        showToast("Imagem adicionada");
        break;
    }
    scrollToSection("proposal-content");
  }

  function handleAddScheduleBlock(): void {
    addBlock({
      id: crypto.randomUUID(),
      type: "schedule",
      items: [createScheduleItem()],
    });
    showToast("Cronograma adicionado");
    scrollToSection("proposal-content");
  }

  return (
    <div className="flex flex-wrap items-center gap-[0.375rem] rounded-full border border-zinc-200 bg-background/90 px-[0.625rem] py-[0.375rem] shadow-sm backdrop-blur dark:border-zinc-700">
      <BuilderButton variant="ghost" onClick={() => handleAddBlock("text")}>
        <Text className="size-[0.875rem]" aria-hidden />
        Adicionar Texto
      </BuilderButton>
      <BuilderButton variant="ghost" onClick={() => handleAddBlock("heading")}>
        <Heading className="size-[0.875rem]" aria-hidden />
        Adicionar Título
      </BuilderButton>
      <BuilderButton variant="ghost" onClick={() => handleAddBlock("divider")}>
        <Minus className="size-[0.875rem]" aria-hidden />
        Adicionar Divisor
      </BuilderButton>
      <BuilderButton variant="ghost" onClick={() => handleAddBlock("image")}>
        <ImageIcon className="size-[0.875rem]" aria-hidden />
        Adicionar Imagem
      </BuilderButton>
      <BuilderButton variant="ghost" onClick={handleAddScheduleBlock}>
        <CalendarPlus className="size-[0.875rem]" aria-hidden />
        Adicionar Cronograma
      </BuilderButton>

      <span className="mx-[0.25rem] h-[1.25rem] w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />

      <BuilderButton variant="ghost" onClick={undo} disabled={!canUndo}>
        <Undo2 className="size-[0.875rem]" aria-hidden />
        Desfazer
      </BuilderButton>
      <BuilderButton variant="ghost" onClick={redo} disabled={!canRedo}>
        <Redo2 className="size-[0.875rem]" aria-hidden />
        Refazer
      </BuilderButton>

      <span className="mx-[0.25rem] h-[1.25rem] w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />

      <div className="w-[5.5rem]">
        <BuilderSelect
          value={String(zoom)}
          onChange={(event) => setZoom(Number(event.target.value) as ProposalZoom)}
          aria-label="Nível de zoom"
        >
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
        </BuilderSelect>
      </div>
    </div>
  );
}
