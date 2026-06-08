"use client";

import { Monitor } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function DesktopOnlyGuard({ children }: Props): React.ReactElement {
  return (
    <>
      <div className="hidden min-[1024px]:contents">{children}</div>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-[1rem] bg-background px-[1.5rem] text-center min-[1024px]:hidden">
        <div className="flex size-[3.5rem] items-center justify-center rounded-full border border-zinc-200 bg-background shadow-sm dark:border-zinc-800">
          <Monitor className="size-[1.5rem] text-zinc-500" aria-hidden />
        </div>
        <p className="max-w-[24rem] text-[0.9375rem] leading-[1.5rem] text-zinc-600 dark:text-zinc-400">
          O Construtor de Propostas foi otimizado para experiência em desktop
        </p>
      </div>
    </>
  );
}
