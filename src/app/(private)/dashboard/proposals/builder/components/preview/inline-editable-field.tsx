"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/helpers/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function InlineEditableField({
  value,
  onChange,
  multiline = false,
  className,
  placeholder,
}: Props): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    const next = ref.current?.textContent ?? "";
    if (next !== value) {
      onChange(next);
    }
  }, [onChange, value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!multiline && event.key === "Enter") {
        event.preventDefault();
        ref.current?.blur();
      }
    },
    [multiline],
  );

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      data-placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "rounded-[0.25rem] outline-none transition-shadow duration-200",
        "empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)]",
        "focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-200",
        className,
      )}
    />
  );
}
