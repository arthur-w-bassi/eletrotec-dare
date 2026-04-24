"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { postResetPassword } from "@/domain/auth/auth-api";
import { resetPasswordSchema, type ResetPasswordPayload } from "@/domain/auth/auth-types";
import { ApiClientError } from "@/domain/utils/api-utils";
import { cn } from "@/helpers/cn";

export function ResetPasswordForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const userId = searchParams.get("userId") ?? "";

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, userId, newPassword: "" },
  });

  useEffect(() => {
    form.reset({ token, userId, newPassword: "" });
  }, [token, userId, form]);

  async function onSubmit(data: ResetPasswordPayload): Promise<void> {
    try {
      await postResetPassword(data);
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    }
  }

  if (!token || !userId) {
    return (
      <p className="rounded-[0.5rem] bg-amber-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        Link inválido. Abre o link completo enviado por email.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-[0.875rem]" onSubmit={form.handleSubmit(onSubmit)}>
      <input type="hidden" {...form.register("token")} />
      <input type="hidden" {...form.register("userId")} />
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="newPassword">
          Nova palavra-passe
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className={cn(
            "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
            form.formState.errors.newPassword && "border-red-500",
          )}
          {...form.register("newPassword")}
        />
        {form.formState.errors.newPassword ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.newPassword.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="rounded-full bg-foreground py-[0.625rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "A guardar…" : "Guardar"}
      </button>
    </form>
  );
}
