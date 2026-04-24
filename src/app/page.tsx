import Link from "next/link";

export default function HomePage(): React.ReactElement {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[1.5rem] p-[2rem]">
      <h1 className="text-[1.75rem] font-semibold leading-[2.25rem]">Eletro Tec Dare ERP</h1>
      <p className="max-w-[28rem] text-center text-[1rem] leading-[1.5rem] text-zinc-600 dark:text-zinc-400">
        Autenticação com sessão em cookie, PostgreSQL e RBAC. Configura{" "}
        <code className="rounded bg-zinc-100 px-[0.25rem] py-[0.125rem] text-[0.875rem] dark:bg-zinc-800">
          DATABASE_URL
        </code>{" "}
        e corre{" "}
        <code className="rounded bg-zinc-100 px-[0.25rem] py-[0.125rem] text-[0.875rem] dark:bg-zinc-800">
          npm run prisma:migrate
        </code>
        .
      </p>
      <div className="flex flex-wrap justify-center gap-[0.75rem]">
        <Link
          className="rounded-full border border-zinc-300 px-[1.25rem] py-[0.5rem] text-[0.9375rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
          href="/login"
        >
          Entrar
        </Link>
        <Link
          className="rounded-full bg-foreground px-[1.25rem] py-[0.5rem] text-[0.9375rem] font-medium text-background transition-colors hover:opacity-90"
          href="/register"
        >
          Criar conta
        </Link>
        <Link
          className="rounded-full border border-zinc-300 px-[1.25rem] py-[0.5rem] text-[0.9375rem] font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
          href="/dashboard"
        >
          Painel
        </Link>
      </div>
    </div>
  );
}
