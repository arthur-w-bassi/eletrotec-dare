import Link from "next/link";

export default function ForgotPasswordSuccessPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1rem] text-center">
      <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Verifica o email</h1>
      <p className="text-[0.9375rem] leading-[1.375rem] text-zinc-600 dark:text-zinc-400">
        Se o email existir na nossa base, enviámos instruções para redefinires a palavra-passe.
      </p>
      <Link className="font-medium underline" href="/login">
        Voltar ao login
      </Link>
    </div>
  );
}
