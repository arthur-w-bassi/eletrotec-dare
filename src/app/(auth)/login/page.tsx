import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Entrar</h1>
        <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
          Utilizador ou email e palavra-passe.
        </p>
      </div>
      <Suspense fallback={<p className="text-[0.875rem] text-zinc-500">A carregar…</p>}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-[0.875rem] text-zinc-600 dark:text-zinc-400">
        <Link className="font-medium underline" href="/register">
          Criar conta
        </Link>
        {" · "}
        <Link className="font-medium underline" href="/forgot-password">
          Esqueci a palavra-passe
        </Link>
      </p>
    </div>
  );
}
