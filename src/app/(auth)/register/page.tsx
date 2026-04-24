import Link from "next/link";

import { RegisterForm } from "./register-form";

export default function RegisterPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1.25rem]">
      <div>
        <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Criar conta</h1>
        <p className="mt-[0.25rem] text-[0.875rem] text-zinc-600 dark:text-zinc-400">
          Palavra-passe forte: 8+ caracteres, maiúscula, minúscula, número e símbolo.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-[0.875rem] text-zinc-600 dark:text-zinc-400">
        Já tens conta?{" "}
        <Link className="font-medium underline" href="/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
