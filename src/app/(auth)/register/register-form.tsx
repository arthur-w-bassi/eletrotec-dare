"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { registerSchema, type RegisterPayload } from "@/domain/auth/auth-types";
import { useRegister } from "@/domain/auth/useCases/use-register";
import { ApiClientError } from "@/domain/utils/api-utils";
import { cn } from "@/helpers/cn";

export function RegisterForm(): React.ReactElement {
  const router = useRouter();

  const form = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const registerMutation = useRegister({
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-[0.875rem]"
      onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="username">
          Utilizador
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className={cn(
            "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
            form.formState.errors.username && "border-red-500",
          )}
          {...form.register("username")}
        />
        {form.formState.errors.username ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.username.message}</p>
        ) : null}
      </div>
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
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="password">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={cn(
            "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
            form.formState.errors.password && "border-red-500",
          )}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="mt-[0.25rem] rounded-full bg-foreground py-[0.625rem] text-[0.9375rem] font-medium text-background disabled:opacity-50"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "A criar…" : "Registar"}
      </button>
    </form>
  );
}
