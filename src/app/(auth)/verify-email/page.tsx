import { Suspense } from "react";

import { VerifyEmailForm } from "./verify-email-form";

export default function VerifyEmailPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Verificar email</h1>
        <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
          Introduz o código de 6 dígitos enviado por email. Podes reenviar o código abaixo.
        </p>
      </div>
      <Suspense
        fallback={<p className="text-[0.875rem] text-zinc-500">A carregar…</p>}
      >
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
