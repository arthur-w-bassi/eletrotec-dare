import type { ProposalTemplate } from "@/domain/proposal/proposal-types";

import { ServiceCardSkeleton } from "./service-card-skeleton";
import { TemplateCard } from "./template-card";

interface Props {
  templates: ProposalTemplate[];
  isLoading: boolean;
}

export function TemplatesList({ templates, isLoading }: Props): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[0.75rem]">
        {Array.from({ length: 4 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="py-[2rem] text-center text-[0.8125rem] text-zinc-500">
        Nenhum pré-modelo encontrado
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[0.75rem]">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
