"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { forgotPasswordSchema, type ForgotPasswordPayload } from "@/domain/auth/auth-types";
import { postForgotPassword } from "@/domain/auth/auth-api";
import { cn } from "@/helpers/cn";

export function ForgotPasswordForm(): React.ReactElement {
  const router = useRouter();
  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordPayload): Promise<void> {
    try {
      await postForgotPassword(data);
      router.push("/forgot-password/success");
    } catch {
      router.push("/forgot-password/success");
    }
  }

  return (
    <form className="flex flex-col gap-[0.875rem]" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={cn(
            "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
            form.formState.errors.email && "border-red-500",
          )}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="rounded-full bg-foreground py-[0.625rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "A enviar…" : "Enviar"}
      </button>
    </form>
  );
}
