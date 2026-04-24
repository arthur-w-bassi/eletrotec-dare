import Link from "next/link";

import { OrderEditForm } from "./order-edit-form";

export default async function EditOrderPage({
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
          href={`/dashboard/orders/${id}`}
        >
          Voltar ao pedido
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Editar pedido</h2>
      <OrderEditForm id={id} />
    </div>
  );
}
