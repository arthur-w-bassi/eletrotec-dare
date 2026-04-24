import Link from "next/link";

import { CatalogCreateForm } from "./catalog-create-form";

export default function NewCatalogItemPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/catalog"
        >
          Voltar à lista
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Novo item</h2>
      <CatalogCreateForm />
    </div>
  );
}
