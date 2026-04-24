"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { postSendVerification, postVerifyEmail } from "@/domain/auth/auth-api";
import { verifyEmailSchema, type VerifyEmailPayload } from "@/domain/auth/auth-types";
import { ApiClientError } from "@/domain/utils/api-utils";
import { cn } from "@/helpers/cn";

export function VerifyEmailForm(): React.ReactElement {
  const router = useRouter();
  const form = useForm<VerifyEmailPayload>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(data: VerifyEmailPayload): Promise<void> {
    try {
      await postVerifyEmail(data);
      form.reset();
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    }
  }

  async function onResend(): Promise<void> {
    setResendState("sending");
    try {
      await postSendVerification();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  return (
    <div className="flex flex-col gap-[1rem]">
      <form className="flex flex-col gap-[0.875rem]" onSubmit={form.handleSubmit(onSubmit)}>
        {form.formState.errors.root ? (
          <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-[0.875rem] font-medium" htmlFor="code">
            Código de 6 dígitos
          </label>
          <input
            id="code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            className={cn(
              "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] tracking-widest dark:border-zinc-600",
              form.formState.errors.code && "border-red-500",
            )}
            {...form.register("code")}
          />
          {form.formState.errors.code ? (
            <p className="text-[0.8125rem] text-red-600">{form.formState.errors.code.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          className="rounded-full bg-foreground py-[0.625rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "A verificar…" : "Confirmar"}
        </button>
      </form>
      <div className="flex flex-col gap-[0.5rem] border-t border-zinc-200 pt-[1rem] dark:border-zinc-800">
        <button
          type="button"
          className="text-left text-[0.875rem] font-medium underline disabled:opacity-50"
          disabled={resendState === "sending"}
          onClick={() => void onResend()}
        >
          {resendState === "sending" ? "A enviar…" : "Reenviar código"}
        </button>
        {resendState === "sent" ? (
          <p className="text-[0.8125rem] text-zinc-600 dark:text-zinc-400">Se configurado, enviámos um novo email.</p>
        ) : null}
        {resendState === "error" ? (
          <p className="text-[0.8125rem] text-red-600">Não foi possível reenviar. Tenta mais tarde.</p>
        ) : null}
      </div>
    </div>
  );
}
