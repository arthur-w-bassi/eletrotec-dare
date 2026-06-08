import { Suspense } from "react";

import { ProposalBuilder } from "./components/proposal-builder";

export default function ProposalBuilderPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-background text-[0.875rem] text-zinc-500">
          A carregar…
        </div>
      }
    >
      <ProposalBuilder />
    </Suspense>
  );
}
