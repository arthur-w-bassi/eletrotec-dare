import Link from "next/link";

import { ServiceOrderCreateForm } from "./service-order-create-form";

export default function NewServiceOrderPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/orders/new"
        >
          Voltar
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Novo pedido de serviço</h2>
      <p className="max-w-[40rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
        Preenche os dados do serviço. Podes associar um cliente e um item do catálogo; as descrições
        pré-definidas vêm dos itens de serviço cadastrados. Se o catálogo não carregar, ainda podes
        criar o pedido e escrever a descrição à mão.
      </p>
      <ServiceOrderCreateForm />
    </div>
  );
}
