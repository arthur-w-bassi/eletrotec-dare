"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  calculateFinancialSummary,
  calculateInternalCostsTotal,
  formatCurrency,
} from "@/domain/proposal/proposal-calculations";
import { normalizeProposal } from "@/domain/proposal/proposal-normalize";
import {
  INTRODUCTION_SECTION_KEY,
  SERVICES_SECTION_KEY,
  normalizeSectionOrder,
} from "@/domain/proposal/proposal-section-order";
import type { ProposalDocument, ProposalBlock } from "@/domain/proposal/proposal-types";
import { useCompleteProposal } from "@/domain/proposal/useCases/use-complete-proposal";
import { useDeleteProposal } from "@/domain/proposal/useCases/use-delete-proposal";
import { useProposal } from "@/domain/proposal/useCases/use-proposal";

import { ProposalStatusBadge } from "../../proposal-status-badge";

interface Props {
  id: string;
}

function displayValue(value: string | undefined): string {
  return value?.trim() ? value.trim() : "—";
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="flex flex-col gap-[0.75rem]">
      <h3 className="text-[0.75rem] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-[0.125rem] text-[1rem] text-foreground">{value}</dd>
    </div>
  );
}

function DetailText({ children }: { children: string }): React.ReactElement {
  return (
    <p className="whitespace-pre-wrap text-[0.9375rem] leading-[1.625rem] text-zinc-700 dark:text-zinc-300">
      {children}
    </p>
  );
}

function DetailTable({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-[0.5rem] border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-[0.8125rem]">{children}</table>
    </div>
  );
}

function DetailTableHead({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <thead>
      <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
        {children}
      </tr>
    </thead>
  );
}

function DetailTableTh({ children, className }: { children: React.ReactNode; className?: string }): React.ReactElement {
  return (
    <th className={`px-[0.75rem] py-[0.5rem] font-medium ${className ?? ""}`}>{children}</th>
  );
}

function DetailTableRow({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}): React.ReactElement {
  return (
    <tr
      className={`border-b border-zinc-100 last:border-b-0 dark:border-zinc-800 ${
        index % 2 === 0 ? "bg-transparent" : "bg-zinc-50/50 dark:bg-zinc-900/40"
      }`}
    >
      {children}
    </tr>
  );
}

function DetailTableTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <td className={`px-[0.75rem] py-[0.5rem] align-top text-zinc-700 dark:text-zinc-200 ${className ?? ""}`}>
      {children}
    </td>
  );
}

function CustomBlocksContent({ blocks }: { blocks: ProposalBlock[] }): React.ReactElement {
  return (
    <div className="flex flex-col gap-[0.75rem]">
      {blocks.map((block) => {
        switch (block.type) {
          case "text":
            return (
              <p key={block.id} className="text-[0.875rem] leading-[1.5rem] text-zinc-700 dark:text-zinc-300">
                {block.content}
              </p>
            );
          case "heading":
            return (
              <h4 key={block.id} className="text-[1.125rem] font-semibold text-foreground">
                {block.content}
              </h4>
            );
          case "divider":
            return <hr key={block.id} className="border-zinc-200 dark:border-zinc-700" />;
          case "image":
            return (
              <div
                key={block.id}
                className="flex aspect-video items-center justify-center rounded-[0.5rem] border border-dashed border-zinc-300 bg-zinc-50 text-[0.8125rem] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400"
              >
                {block.alt}
              </div>
            );
          case "schedule":
            return block.items.length > 0 ? (
              <DetailSection key={block.id} title="Cronograma">
                <DetailTable>
                  <DetailTableHead>
                    <DetailTableTh className="w-[7rem]">Prazo</DetailTableTh>
                    <DetailTableTh>Atividade</DetailTableTh>
                    <DetailTableTh>Observações</DetailTableTh>
                  </DetailTableHead>
                  <tbody>
                    {block.items.map((item, index) => (
                      <DetailTableRow key={item.id} index={index}>
                        <DetailTableTd className="font-medium text-foreground">
                          {displayValue(item.period)}
                        </DetailTableTd>
                        <DetailTableTd>{displayValue(item.activity)}</DetailTableTd>
                        <DetailTableTd className="text-zinc-600 dark:text-zinc-300">
                          {displayValue(item.notes)}
                        </DetailTableTd>
                      </DetailTableRow>
                    ))}
                  </tbody>
                </DetailTable>
              </DetailSection>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

function OrderedProposalSections({ proposal }: { proposal: ProposalDocument }): React.ReactElement {
  const normalized = normalizeProposal(proposal);
  const sectionOrder = normalizeSectionOrder(normalized);
  const blocksById = new Map(normalized.blocks.map((block) => [block.id, block]));

  return (
    <>
      {sectionOrder.map((sectionKey) => {
        if (sectionKey === INTRODUCTION_SECTION_KEY) {
          if (!normalized.introduction.trim()) return null;

          return (
            <DetailSection key={sectionKey} title="Introdução">
              <DetailText>{normalized.introduction}</DetailText>
            </DetailSection>
          );
        }

        if (sectionKey === SERVICES_SECTION_KEY) {
          if (normalized.lineItems.length === 0) return null;

          return (
            <DetailSection key={sectionKey} title="Serviços">
              <div className="flex flex-col gap-[0.75rem]">
                {normalized.lineItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[0.5rem] border border-zinc-200 p-[0.875rem] dark:border-zinc-700"
                  >
                    <p className="text-center font-medium text-foreground">{item.title}</p>
                    {item.description.trim() ? (
                      <p className="mt-[0.375rem] text-center text-[0.875rem] leading-[1.5rem] text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </p>
                    ) : null}
                    {item.images.length > 0 ? (
                      <div className="mt-[0.625rem] grid grid-cols-3 gap-[0.5rem]">
                        {item.images.map((src, index) => (
                          <div
                            key={`${item.id}-image-${index}`}
                            className="aspect-video overflow-hidden rounded-[0.375rem] bg-zinc-100 dark:bg-zinc-800"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt=""
                              crossOrigin="anonymous"
                              className="size-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <dl className="mt-[0.625rem] flex flex-wrap gap-x-[1.25rem] gap-y-[0.25rem] text-[0.8125rem] text-zinc-600 dark:text-zinc-400">
                      <div>
                        <dt className="inline text-zinc-500 dark:text-zinc-500">Qtd.: </dt>
                        <dd className="inline text-foreground">{item.qty}</dd>
                      </div>
                      <div>
                        <dt className="inline text-zinc-500 dark:text-zinc-500">Preço unit.: </dt>
                        <dd className="inline text-foreground">{formatCurrency(item.unitPrice)}</dd>
                      </div>
                      <div>
                        <dt className="inline text-zinc-500 dark:text-zinc-500">Total: </dt>
                        <dd className="inline font-medium text-foreground">
                          {formatCurrency(item.qty * item.unitPrice)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </DetailSection>
          );
        }

        if (sectionKey.startsWith("block:")) {
          const block = blocksById.get(sectionKey.slice("block:".length));
          if (!block) return null;

          return <CustomBlocksContent key={sectionKey} blocks={[block]} />;
        }

        return null;
      })}
    </>
  );
}

function ProposalContent({ proposal }: { proposal: ProposalDocument }): React.ReactElement {
  const summary = calculateFinancialSummary(proposal);
  const internalCosts = proposal.internalCosts ?? [];
  const internalCostsTotal = calculateInternalCostsTotal(internalCosts);
  const { cover } = proposal;

  return (
    <div className="flex flex-col gap-[1.5rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
      <dl className="grid gap-[0.75rem] sm:grid-cols-2">
        <DetailRow label="Data da proposta" value={displayValue(cover.date)} />
        <DetailRow label="Cliente" value={displayValue(cover.client)} />
        <DetailRow label="Endereço do cliente" value={displayValue(cover.clientAddress)} />
        <DetailRow label="CNPJ/CPF" value={displayValue(cover.clientDocument)} />
        <DetailRow label="Contato do cliente" value={displayValue(cover.clientContact)} />
      </dl>

      <OrderedProposalSections proposal={proposal} />

      <DetailSection title="Resumo financeiro">
        <DetailTable>
          <DetailTableHead>
            <DetailTableTh>Serviço</DetailTableTh>
            <DetailTableTh className="w-[4.5rem]">Qtd.</DetailTableTh>
            <DetailTableTh className="w-[7.5rem]">Preço unit.</DetailTableTh>
            <DetailTableTh className="text-right">Total</DetailTableTh>
          </DetailTableHead>
          <tbody>
            {proposal.lineItems.map((item, index) => (
              <DetailTableRow key={item.id} index={index}>
                <DetailTableTd className="font-medium text-foreground">{item.title}</DetailTableTd>
                <DetailTableTd>{item.qty}</DetailTableTd>
                <DetailTableTd>{formatCurrency(item.unitPrice)}</DetailTableTd>
                <DetailTableTd className="text-right font-medium text-foreground">
                  {formatCurrency(item.qty * item.unitPrice)}
                </DetailTableTd>
              </DetailTableRow>
            ))}
          </tbody>
        </DetailTable>

        <dl className="ml-auto mt-[0.75rem] flex max-w-[16rem] flex-col gap-[0.375rem] text-[0.8125rem]">
          <div className="flex justify-between gap-[1rem]">
            <dt className="text-zinc-500 dark:text-zinc-400">Subtotal</dt>
            <dd className="font-medium text-foreground">{formatCurrency(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-[1rem]">
            <dt className="text-zinc-500 dark:text-zinc-400">
              Desconto ({proposal.financial.discountPercent}%)
            </dt>
            <dd className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(summary.discount)}
            </dd>
          </div>
          <div className="flex justify-between gap-[1rem]">
            <dt className="text-zinc-500 dark:text-zinc-400">
              Impostos ({proposal.financial.taxPercent}%)
            </dt>
            <dd className="font-medium text-foreground">{formatCurrency(summary.tax)}</dd>
          </div>
          <div className="mt-[0.25rem] flex justify-between gap-[1rem] border-t border-zinc-200 pt-[0.5rem] text-[0.9375rem] dark:border-zinc-700">
            <dt className="font-semibold text-foreground">Total geral</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(summary.grandTotal)}</dd>
          </div>
        </dl>
      </DetailSection>

      {internalCosts.length > 0 ? (
        <DetailSection title="Valores internos">
          <DetailTable>
            <DetailTableHead>
              <DetailTableTh>Descrição</DetailTableTh>
              <DetailTableTh className="text-right">Valor</DetailTableTh>
            </DetailTableHead>
            <tbody>
              {internalCosts.map((item, index) => (
                <DetailTableRow key={item.id} index={index}>
                  <DetailTableTd className="font-medium text-foreground">
                    {displayValue(item.description)}
                  </DetailTableTd>
                  <DetailTableTd className="text-right font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </DetailTableTd>
                </DetailTableRow>
              ))}
            </tbody>
          </DetailTable>

          <dl className="ml-auto mt-[0.75rem] flex max-w-[16rem] flex-col gap-[0.375rem] text-[0.8125rem]">
            <div className="mt-[0.25rem] flex justify-between gap-[1rem] border-t border-zinc-200 pt-[0.5rem] text-[0.9375rem] dark:border-zinc-700">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-semibold text-foreground">{formatCurrency(internalCostsTotal)}</dd>
            </div>
          </dl>
        </DetailSection>
      ) : null}

      {proposal.notes.trim() ? (
        <DetailSection title="Observações">
          <DetailText>{proposal.notes}</DetailText>
        </DetailSection>
      ) : null}

      <DetailSection title="Assinatura e aceite">
        <dl className="grid gap-[0.75rem] sm:grid-cols-2">
          <DetailRow label="Preparado por" value={displayValue(proposal.signature.preparedBy)} />
          <DetailRow label="Data" value={displayValue(proposal.signature.date)} />
        </dl>
      </DetailSection>
    </div>
  );
}

export function ProposalDetailPage({ id }: Props): React.ReactElement {
  const router = useRouter();
  const { data, isLoading, isError } = useProposal(id);
  const complete = useCompleteProposal();
  const remove = useDeleteProposal({
    onSuccess: () => {
      router.push("/dashboard/proposals");
      router.refresh();
    },
  });

  function handleMarkCompleted(): void {
    complete.mutate(id);
  }

  function handleDeleteDraft(): void {
    const ok = window.confirm("Excluir este rascunho? Esta ação não pode ser anulada.");
    if (!ok) return;
    remove.mutate(id);
  }

  const actionPending = complete.isPending || remove.isPending;

  if (isLoading) {
    return <p className="text-[0.875rem] text-zinc-500 dark:text-zinc-400">A carregar…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-[0.75rem]">
        <p className="text-[0.875rem] text-zinc-600 dark:text-zinc-400">Orçamento não encontrado.</p>
        <Link className="text-[0.875rem] underline" href="/dashboard/proposals">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const { listItem, proposal } = data;

  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground dark:text-zinc-400"
          href="/dashboard/proposals"
        >
          Voltar à lista
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-[0.75rem]">
        <div>
          <h2 className="text-[1.125rem] font-semibold leading-[1.5rem] text-foreground">
            {listItem.number}
          </h2>
          <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
            {listItem.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[0.5rem]">
          <Link
            className="rounded-full bg-foreground px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-background"
            href={`/dashboard/proposals/builder?id=${id}`}
          >
            Editar proposta
          </Link>
          <ProposalStatusBadge status={listItem.status} />
        </div>
      </div>

      <dl className="grid gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
        <DetailRow label="Cliente" value={listItem.client} />
        <DetailRow label="Serviços incluídos" value={String(listItem.serviceCount)} />
        <DetailRow label="Total geral" value={formatCurrency(listItem.grandTotal)} />
        <DetailRow label="Criado em" value={formatDateTime(listItem.createdAt)} />
        <DetailRow label="Atualizado em" value={formatDateTime(listItem.updatedAt)} />
      </dl>

      <ProposalContent proposal={proposal} />

      {listItem.status === "draft" ? (
        <div className="flex flex-wrap gap-[0.5rem]">
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
            onClick={handleMarkCompleted}
            disabled={actionPending}
          >
            {complete.isPending ? "A concluir…" : "Marcar como concluído"}
          </button>
          <button
            type="button"
            className="rounded-full border border-red-300 px-[1rem] py-[0.5rem] text-[0.875rem] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            onClick={handleDeleteDraft}
            disabled={actionPending}
          >
            {remove.isPending ? "A excluir…" : "Excluir rascunho"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
