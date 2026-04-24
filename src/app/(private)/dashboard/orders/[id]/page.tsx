import { OrderDetailPage } from "./order-detail-page";

export default async function OrderPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<React.ReactElement> {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
