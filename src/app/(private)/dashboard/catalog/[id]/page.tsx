import { CatalogDetailPage } from "./catalog-detail-page";

export default async function CatalogItemPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<React.ReactElement> {
  const { id } = await params;
  return <CatalogDetailPage id={id} />;
}
