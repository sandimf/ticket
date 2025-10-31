"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Gunakan useState agar QueryClient hanya dibuat sekali per sesi
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Opsional: Atur default staleTime, misal 5 menit
            staleTime: 1000 * 60 * 5,
            // Opsional: Tidak otomatis refetch saat window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Alat bantu debug, akan hilang di produksi */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}