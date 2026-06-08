"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/helpers/cn";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  integer?: boolean;
  formatDisplay?: (value: number) => string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
}

function parseNumberInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let cleaned = trimmed.replace(/[^\d,.-]/g, "");
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampValue(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

export function InlineEditableNumberField({
  value,
  onChange,
  min,
  max,
  integer = false,
  formatDisplay,
  className,
  inputClassName,
  ariaLabel,
}: Props): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = formatDisplay ? formatDisplay(value) : String(value);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = displayValue;
    }
  }, [displayValue]);

  const commitValue = useCallback(() => {
    const raw = inputRef.current?.value ?? "";
    const parsed = parseNumberInput(raw);
    if (parsed === null) {
      if (inputRef.current) inputRef.current.value = displayValue;
      return;
    }

    let next = clampValue(parsed, min, max);
    if (integer) next = Math.round(next);

    if (inputRef.current) {
      inputRef.current.value = formatDisplay ? formatDisplay(next) : String(next);
    }

    if (next !== value) {
      onChange(next);
    }
  }, [displayValue, formatDisplay, integer, max, min, onChange, value]);

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        inputRef.current?.blur();
      }
    },
    [],
  );

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      defaultValue={displayValue}
      aria-label={ariaLabel}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full min-w-0 rounded-[0.25rem] border-0 bg-transparent p-0 outline-none transition-shadow duration-200",
        "focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-200",
        className,
        inputClassName,
      )}
    />
  );
}
