import Link from "next/link";

export default function NewOrderPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/orders"
        >
          Voltar à lista
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Novo pedido</h2>
      <p className="max-w-[40rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
        Escolhe o tipo de pedido que queres criar. Cada fluxo tem campos adequados a serviços ou a
        produtos.
      </p>
      <div className="flex max-w-[40rem] flex-col gap-[0.75rem] sm:flex-row sm:items-stretch">
        <Link
          href="/dashboard/orders/new/service"
          className="flex flex-1 flex-col gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 bg-zinc-50/50 p-[1rem] text-left transition-colors hover:border-foreground/20 hover:bg-zinc-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60"
        >
          <span className="text-[0.9375rem] font-semibold text-foreground">Criar Serviço</span>
          <span className="text-[0.8125rem] leading-[1.25rem] text-zinc-600 dark:text-zinc-400">
            Ordens de serviço, reparações ou trabalhos com descrição e valorização típicos de
            serviço.
          </span>
        </Link>
        <Link
          href="/dashboard/orders/new/product"
          className="flex flex-1 flex-col gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 bg-zinc-50/50 p-[1rem] text-left transition-colors hover:border-foreground/20 hover:bg-zinc-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60"
        >
          <span className="text-[0.9375rem] font-semibold text-foreground">Criar Produto</span>
          <span className="text-[0.8125rem] leading-[1.25rem] text-zinc-600 dark:text-zinc-400">
            Vendas de artigos do catálogo com observações e totais orientados a produto.
          </span>
        </Link>
      </div>
    </div>
  );
}
