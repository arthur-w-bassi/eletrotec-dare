"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginPayload } from "@/domain/auth/auth-types";
import { useLogin } from "@/domain/auth/useCases/use-login";
import { ApiClientError } from "@/domain/utils/api-utils";
import { cn } from "@/helpers/cn";

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const login = useLogin({
    onSuccess: () => {
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.status === 401) {
        form.setError("root", { message: err.message });
      } else if (err instanceof ApiClientError) {
        form.setError("root", { message: err.message });
      } else {
        form.setError("root", { message: "Erro inesperado." });
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-[0.875rem]"
      onSubmit={form.handleSubmit((data) => login.mutate(data))}
    >
      {form.formState.errors.root ? (
        <p className="rounded-[0.5rem] bg-red-50 px-[0.75rem] py-[0.5rem] text-[0.875rem] text-red-800 dark:bg-red-950 dark:text-red-200">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="identifier">
          Utilizador ou email
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          className={cn(
            "rounded-[0.5rem] border border-zinc-300 bg-transparent px-[0.75rem] py-[0.5rem] text-[1rem] dark:border-zinc-600",
            form.formState.errors.identifier && "border-red-500",
          )}
          {...form.register("identifier")}
        />
        {form.formState.errors.identifier ? (
          <p className="text-[0.8125rem] text-red-600">{form.formState.errors.identifier.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-[0.875rem] font-medium" htmlFor="password">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
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
        disabled={login.isPending}
      >
        {login.isPending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
