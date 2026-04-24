"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/infra/queryKey/query-key";

import * as authApi from "../auth-api";
import type { UserDTO } from "../auth-types";

export function useCurrentUser(): ReturnType<typeof useQuery<UserDTO, Error>> {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    retry: false,
  });
}
