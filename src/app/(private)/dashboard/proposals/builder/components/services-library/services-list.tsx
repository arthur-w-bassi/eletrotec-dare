import type { MockService } from "@/domain/proposal/proposal-types";

import { DraggableServiceCard } from "./draggable-service-card";
import { ServiceCardSkeleton } from "./service-card-skeleton";

interface Props {
  services: MockService[];
  isLoading: boolean;
}

export function ServicesList({ services, isLoading }: Props): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[0.75rem]">
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <p className="py-[2rem] text-center text-[0.8125rem] text-zinc-500">Nenhum serviço encontrado</p>
    );
  }

  return (
    <div className="flex flex-col gap-[0.75rem]">
      {services.map((service) => (
        <DraggableServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
