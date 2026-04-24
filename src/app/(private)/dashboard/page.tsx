import Link from "next/link";

import { mapUserToDTO } from "@/domain/auth/auth-service";
import { getServerAuthUser } from "@/lib/auth/guards";

import { DashboardActions } from "./dashboard-actions";

export default async function DashboardPage(): Promise<React.ReactElement> {
  const user = await getServerAuthUser();
  if (!user) {
    return <></>;
  }
  const dto = mapUserToDTO(user);

  return (
    <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-[1.25rem] p-[1.5rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Painel</h1>
        <DashboardActions />
      </div>
      <dl className="grid gap-[0.75rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800">
        <div>
          <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Utilizador</dt>
          <dd className="text-[1rem]">{dto.username}</dd>
        </div>
        <div>
          <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Email</dt>
          <dd className="text-[1rem]">{dto.email}</dd>
        </div>
        <div>
          <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Email verificado</dt>
          <dd className="text-[1rem]">{dto.emailVerifiedAt ? "Sim" : "Não"}</dd>
        </div>
        <div>
          <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Papéis</dt>
          <dd className="text-[1rem]">{dto.roles.join(", ")}</dd>
        </div>
      </dl>
      {!dto.emailVerifiedAt ? (
        <p className="text-[0.9375rem] leading-[1.375rem] text-zinc-600 dark:text-zinc-400">
          Confirma o email na página de{" "}
          <Link className="font-medium underline" href="/verify-email">
            verificação
          </Link>
          .
        </p>
      ) : null}
      <div className="flex flex-col gap-[0.5rem] text-[0.875rem]">
        <Link className="text-zinc-500 underline hover:text-foreground" href="/dashboard/catalog">
          Catálogo
        </Link>
        <Link className="text-zinc-500 underline hover:text-foreground" href="/dashboard/customers">
          Clientes
        </Link>
        <Link className="text-zinc-500 underline hover:text-foreground" href="/dashboard/orders">
          Pedidos
        </Link>
        <Link className="text-zinc-500 underline hover:text-foreground" href="/">
          Início
        </Link>
      </div>
    </div>
  );
}
