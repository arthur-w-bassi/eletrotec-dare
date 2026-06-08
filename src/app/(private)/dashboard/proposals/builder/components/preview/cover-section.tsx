"use client";

import { ELETROTEC_COMPANY } from "@/domain/proposal/eletrotec-company";
import type { ProposalCover } from "@/domain/proposal/proposal-types";

import { useProposalBuilder } from "../proposal-builder-provider";
import { InlineEditableField } from "./inline-editable-field";

interface Props {
  cover: ProposalCover;
}

interface CompanyInfoLineProps {
  label: string;
  value: string;
}

function displayValue(value: string | undefined): string {
  return value?.trim() ? value.trim() : "—";
}

function CompanyInfoLine({ label, value }: CompanyInfoLineProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-[0.125rem] sm:flex-row sm:items-baseline sm:justify-end sm:gap-[1rem]">
      <dt className="shrink-0 text-[0.6875rem] font-medium text-zinc-400">{label}</dt>
      <dd className="text-[0.8125rem] leading-snug text-zinc-800">{value}</dd>
    </div>
  );
}

export function CoverSection({ cover }: Props): React.ReactElement {
  const { updateCover } = useProposalBuilder();

  return (
    <section className="mb-[2.5rem]">
      <header className="relative mb-[1.75rem] pl-[1.125rem]">
        <div
          className="absolute bottom-0 left-0 top-0 w-[0.1875rem] rounded-full bg-[var(--eletrotec-orange)]"
          aria-hidden
        />

        <div className="flex flex-col gap-[1.75rem] pb-[1.75rem] sm:flex-row sm:items-center sm:justify-between sm:gap-[3rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ELETROTEC_COMPANY.logoSrc}
            alt={ELETROTEC_COMPANY.logoAlt}
            crossOrigin="anonymous"
            className="h-[3.25rem] w-auto max-w-[10.5rem] object-contain object-left sm:h-[3.5rem]"
          />

          <dl className="grid gap-[0.5rem] sm:text-right">
            <CompanyInfoLine label="Endereço" value={ELETROTEC_COMPANY.address} />
            <CompanyInfoLine label="CNPJ" value={ELETROTEC_COMPANY.cnpj} />
            <CompanyInfoLine label="Data" value={cover.date} />
            <CompanyInfoLine label="Contato" value={ELETROTEC_COMPANY.contact} />
          </dl>
        </div>
      </header>

      <aside className="mb-[2rem] overflow-hidden rounded-[0.625rem] border border-zinc-200">
        <div className="border-b border-zinc-200 bg-[var(--eletrotec-orange-soft)] px-[1.125rem] py-[0.5rem]">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--eletrotec-orange)]">
            Proposta para
          </p>
        </div>

        <div className="px-[1.125rem] py-[1rem]">
          <InlineEditableField
            value={cover.client}
            onChange={(client) => updateCover({ client })}
            className="text-[1.0625rem] font-semibold leading-snug text-zinc-900"
            placeholder="Nome do cliente"
          />

          <InlineEditableField
            value={cover.clientAddress ?? ""}
            onChange={(clientAddress) => updateCover({ clientAddress })}
            multiline
            className="mt-[0.5rem] text-[0.8125rem] leading-relaxed text-zinc-600"
            placeholder="Endereço do cliente"
          />

          <div className="mt-[0.375rem] flex flex-wrap items-baseline gap-x-[0.625rem] gap-y-[0.25rem] text-[0.8125rem] text-zinc-600">
            <span className="inline-flex flex-wrap items-baseline gap-[0.375rem]">
              <span className="text-zinc-400">CNPJ/CPF</span>
              <InlineEditableField
                value={cover.clientDocument ?? ""}
                onChange={(clientDocument) => updateCover({ clientDocument })}
                className="font-medium text-zinc-700"
                placeholder="Documento"
              />
            </span>
            <span className="text-zinc-300" aria-hidden>
              ·
            </span>
            <span className="inline-flex flex-wrap items-baseline gap-[0.375rem]">
              <span className="text-zinc-400">Contato</span>
              <InlineEditableField
                value={cover.clientContact ?? ""}
                onChange={(clientContact) => updateCover({ clientContact })}
                className="font-medium text-zinc-700"
                placeholder="Telefone ou e-mail"
              />
            </span>
          </div>

          {!cover.client.trim() &&
          !cover.clientAddress?.trim() &&
          !cover.clientDocument?.trim() &&
          !cover.clientContact?.trim() ? (
            <p className="mt-[0.5rem] text-[0.75rem] text-zinc-400">
              Selecione um cliente acima ou preencha os campos manualmente.
            </p>
          ) : null}
        </div>
      </aside>

      <div>
        <div className="flex flex-col gap-[1.25rem] sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <InlineEditableField
              value={cover.title}
              onChange={(title) => updateCover({ title })}
              className="text-[1.625rem] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[1.875rem]"
              placeholder="Título da proposta"
            />
          </div>

          <p className="shrink-0 font-mono text-[0.75rem] tracking-wide text-zinc-400 sm:pb-[0.125rem]">
            {displayValue(cover.number)}
          </p>
        </div>
      </div>
    </section>
  );
}
