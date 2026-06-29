"use client";

import { useEffect, useRef } from "react";

import { useProposalBuilder } from "../proposal-builder-provider";
import { CoverSection } from "./cover-section";
import { DocumentBodySections } from "./document-body-sections";
import { FinancialSummarySection } from "./financial-summary-section";
import { InternalCostsSection } from "./internal-costs-section";
import { NotesSection } from "./notes-section";
import { FooterSection } from "./footer-section";
import { SignatureSection } from "./signature-section";

export function ProposalDocument(): React.ReactElement {
  const { proposal, registerDocumentElement } = useProposalBuilder();
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerDocumentElement(articleRef.current);
    return () => registerDocumentElement(null);
  }, [registerDocumentElement]);

  return (
    <article
      ref={articleRef}
      id="proposal-document"
      className="mx-auto min-h-[70rem] max-w-[49.625rem] rounded-[0.75rem] border border-zinc-200 bg-white p-[3rem] text-zinc-900 shadow-lg"
    >
      <CoverSection cover={proposal.cover} />
      <DocumentBodySections proposal={proposal} />
      <FinancialSummarySection proposal={proposal} />
      <InternalCostsSection proposal={proposal} />
      <NotesSection notes={proposal.notes} />
      <SignatureSection signature={proposal.signature} />
      <FooterSection />
    </article>
  );
}
