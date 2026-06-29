"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

import { MAX_SERVICE_IMAGES } from "@/domain/proposal/proposal-types";
import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "../proposal-builder-provider";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface Props {
  lineItemId: string;
  images: string[];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Falha ao ler a imagem."));
    };
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

export function ServiceItemImages({ lineItemId, images }: Props): React.ReactElement {
  const { updateLineItem, showToast } = useProposalBuilder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < MAX_SERVICE_IMAGES;

  const handleAddClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Selecione um arquivo de imagem válido.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast("A imagem deve ter no máximo 5 MB.");
      return;
    }

    if (images.length >= MAX_SERVICE_IMAGES) {
      showToast(`É possível adicionar no máximo ${MAX_SERVICE_IMAGES} imagens.`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateLineItem(lineItemId, { images: [...images, dataUrl] });
    } catch {
      showToast("Não foi possível carregar a imagem.");
    }
  };

  const handleRemove = (index: number): void => {
    updateLineItem(lineItemId, {
      images: images.filter((_, imageIndex) => imageIndex !== index),
    });
  };

  return (
    <div className="mt-[0.25rem]">
      <div className="grid grid-cols-3 gap-[0.5rem]">
        {images.map((src, index) => (
          <div
            key={`${lineItemId}-image-${index}`}
            className="group/image relative aspect-video overflow-hidden rounded-[0.375rem] bg-zinc-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              crossOrigin="anonymous"
              className="size-full object-cover"
              draggable={false}
            />
            <button
              type="button"
              data-builder-chrome
              onClick={() => handleRemove(index)}
              className="absolute right-[0.25rem] top-[0.25rem] flex size-[1.25rem] items-center justify-center rounded-full bg-white/90 text-zinc-400 opacity-0 shadow-sm transition-all hover:text-red-500 group-hover/image:opacity-100"
              aria-label={`Remover imagem ${index + 1}`}
            >
              <X className="size-[0.75rem]" />
            </button>
          </div>
        ))}

        {canAddMore ? (
          <button
            type="button"
            data-builder-chrome
            onClick={handleAddClick}
            className={cn(
              "flex aspect-video flex-col items-center justify-center gap-[0.25rem] rounded-[0.375rem]",
              "border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors",
              "hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
            )}
            aria-label="Adicionar imagem"
          >
            <ImagePlus className="size-[1rem]" />
            <span className="text-[0.625rem] font-medium leading-none">Adicionar</span>
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />
    </div>
  );
}
