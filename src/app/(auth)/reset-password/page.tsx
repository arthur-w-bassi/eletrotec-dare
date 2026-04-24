import Link from "next/link";
import { Suspense } from "react";

import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Nova palavra-passe</h1>
        <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
          Usa o link enviado por email (token válido por 1 hora).
        </p>
      </div>
      <Suspense fallback={<p className="text-[0.875rem] text-zinc-500">A carregar…</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p className="text-center text-[0.875rem]">
        <Link className="font-medium underline" href="/login">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
