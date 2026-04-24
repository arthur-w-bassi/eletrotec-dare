import Link from "next/link";

import { CatalogEditForm } from "./catalog-edit-form";

export default async function EditCatalogItemPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>): Promise<React.ReactElement> {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href={`/dashboard/catalog/${id}`}
        >
          Voltar ao item
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Editar item</h2>
      <CatalogEditForm id={id} />
    </div>
  );
}
