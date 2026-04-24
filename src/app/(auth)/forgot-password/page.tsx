import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Recuperar palavra-passe</h1>
        <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
          Indica o email da conta. Se existir, enviaremos um link (mensagem genérica por segurança).
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-[0.875rem]">
        <Link className="font-medium underline" href="/login">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
