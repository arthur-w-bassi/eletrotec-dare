"use client";

import { useRouter } from "next/navigation";

import { useLogout } from "@/domain/auth/useCases/use-logout";

export function DashboardActions(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout({
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });

  return (
    <button
      type="button"
      className="rounded-full border border-zinc-300 px-[1rem] py-[0.375rem] text-[0.875rem] font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
      disabled={logout.isPending}
      onClick={() => logout.mutate()}
    >
      Sair
    </button>
  );
}
