import { ProposalDetailPage } from "./proposal-detail-page";

export default async function ProposalPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<React.ReactElement> {
  const { id } = await params;
  return <ProposalDetailPage id={id} />;
}
