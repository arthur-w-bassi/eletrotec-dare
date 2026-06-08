import { ELETROTEC_COMPANY } from "@/domain/proposal/eletrotec-company";
import type { ProposalSignature } from "@/domain/proposal/proposal-types";

interface Props {
  signature: ProposalSignature;
}

interface SignatureBlockProps {
  title: string;
  subtitle: string;
}

function SignatureBlock({ title, subtitle }: SignatureBlockProps): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div
        className="flex h-[3.75rem] items-end border-b border-zinc-300"
        aria-label="Linha para assinatura"
      />
      <p className="mt-[0.625rem] text-[0.8125rem] font-medium text-zinc-800">{title}</p>
      <p className="mt-[0.125rem] text-[0.6875rem] text-zinc-400">{subtitle}</p>
    </div>
  );
}

export function SignatureSection({ signature }: Props): React.ReactElement {
  return (
    <section className="border-t border-zinc-200 pt-[2rem]">
      <h3 className="mb-[1.25rem] text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500">
        Assinatura e Aceite
      </h3>

      <div className="mb-[1.75rem] grid gap-[1.5rem] sm:grid-cols-2">
        <div>
          <p className="mb-[0.375rem] text-[0.6875rem] font-medium uppercase tracking-wide text-zinc-400">
            Preparado por
          </p>
          <p className="text-[0.9375rem] font-medium text-zinc-900">{signature.preparedBy}</p>
        </div>
        <div>
          <p className="mb-[0.375rem] text-[0.6875rem] font-medium uppercase tracking-wide text-zinc-400">
            Data
          </p>
          <p className="text-[0.9375rem] font-medium text-zinc-900">{signature.date}</p>
        </div>
      </div>

      <div className="rounded-[0.625rem] border border-zinc-200 bg-zinc-50/50 p-[1.25rem]">
        <div className="grid gap-[2rem] sm:grid-cols-2">
          <SignatureBlock
            title={ELETROTEC_COMPANY.name}
            subtitle="Representante autorizado"
          />
          <SignatureBlock title="Cliente" subtitle="Assinatura e carimbo" />
        </div>
      </div>
    </section>
  );
}
