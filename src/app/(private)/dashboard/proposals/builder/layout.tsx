import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construtor de Propostas | Eletro Tec Dare ERP",
  description: "Monte propostas comerciais com arrastar e soltar",
};

export default function ProposalBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
