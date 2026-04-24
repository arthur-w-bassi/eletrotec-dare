import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationOptions<TData, TError, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn"
>;
