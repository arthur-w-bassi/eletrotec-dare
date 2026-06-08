"use client";

import { cn } from "@/helpers/cn";

import { useProposalBuilder } from "./proposal-builder-provider";
import { ProposalPreviewArea } from "./preview/proposal-preview-area";
import { ServicesLibrary } from "./services-library/services-library";

interface Props {
  isWideDesktop: boolean;
  isMediumDesktop: boolean;
}

export function ProposalBuilderWorkspace({
  isWideDesktop,
  isMediumDesktop,
}: Props): React.ReactElement {
  const { isLibraryOpen, setLibraryOpen } = useProposalBuilder();
  const showCollapsed = isMediumDesktop && !isWideDesktop;
  const isLibraryVisible = isWideDesktop || (showCollapsed && isLibraryOpen);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {showCollapsed && isLibraryOpen ? (
        <button
          type="button"
          aria-label="Fechar biblioteca de serviços"
          className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setLibraryOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-zinc-200 bg-background transition-all duration-300 ease-out dark:border-zinc-800",
          isWideDesktop && "w-[20rem]",
          showCollapsed &&
            (isLibraryOpen
              ? "absolute left-0 top-0 z-30 h-full w-[20rem] shadow-xl"
              : "w-0 overflow-hidden border-r-0"),
          !isWideDesktop && !showCollapsed && "hidden",
        )}
      >
        {isLibraryVisible ? (
          <ServicesLibrary onClose={() => setLibraryOpen(false)} showClose={showCollapsed} />
        ) : null}
      </aside>

      <main className="min-w-0 flex-1">
        <ProposalPreviewArea />
      </main>
    </div>
  );
}
