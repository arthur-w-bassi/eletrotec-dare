import { CustomerDetailPage } from "./customer-detail-page";

export default async function CustomerPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<React.ReactElement> {
  const { id } = await params;
  return <CustomerDetailPage id={id} />;
}
