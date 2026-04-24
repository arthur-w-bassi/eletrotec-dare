"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { createBrowserQueryClient } from "@/lib/query/query-client";

interface Props {
  children: ReactNode;
}

export function QueryProvider({ children }: Props): React.ReactElement {
  const [client] = useState(() => createBrowserQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
